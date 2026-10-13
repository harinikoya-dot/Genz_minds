from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, Prescription, PrescriptionMedicine
from app.schemas.schemas import PrescriptionResponse, PrescriptionConfirmRequest
from app.api.dependencies import get_current_active_user
from app.core.permissions import verify_resource_ownership
from app.services.prescription_service import prescription_service

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

@router.get("/", response_model=List[PrescriptionResponse])
def list_prescriptions(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescriptions = db.query(Prescription).filter(
        Prescription.user_id == current_user.id
    ).order_by(Prescription.created_at.desc()).all()
    return prescriptions

@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(
    prescription_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    verify_resource_ownership(prescription.user_id, current_user.id, "Prescription")
    return prescription

@router.post("/scan")
async def scan_prescription(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    import os, uuid, shutil
    from app.core.config import settings
    from app.services.ocr_service import ocr_service
    from app.models.all_models import MedicalDocument, ExtractedDocumentData

    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    safe_name = f"{file_id}{ext}"
    saved_path = os.path.join(settings.STORAGE_DIR, safe_name)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = MedicalDocument(
        id=file_id,
        user_id=current_user.id,
        original_filename=file.filename,
        storage_path=saved_path,
        mime_type=file.content_type or "application/pdf",
        file_size=os.path.getsize(saved_path),
        document_type="prescription",
        processing_status="completed",
    )
    db.add(doc)
    db.flush()

    ocr_res = ocr_service.extract_text_from_file(saved_path)
    extracted_text = ocr_res["text"]

    db.add(ExtractedDocumentData(
        document_id=doc.id,
        user_id=current_user.id,
        raw_text=extracted_text,
        confidence=ocr_res.get("confidence", 0.95),
        page_count=ocr_res.get("page_count", 1),
    ))

    items = prescription_service.extract_prescription_items(extracted_text)
    presc = Prescription(
        user_id=current_user.id,
        document_id=doc.id,
        doctor_name="Attending Physician",
        clinic_name="Clinical Care Center",
        raw_text=extracted_text,
        is_verified=False,
    )
    db.add(presc)
    db.flush()

    for itm in items:
        db.add(PrescriptionMedicine(
            prescription_id=presc.id,
            user_id=current_user.id,
            medicine_name=itm["medicine_name"],
            generic_name=itm.get("generic_name"),
            strength=itm.get("strength"),
            dosage_form=itm.get("dosage_form", "Tablet"),
            dose=itm.get("dose", "1 tablet"),
            route=itm.get("route", "Oral"),
            frequency=itm.get("frequency", "Once daily"),
            duration=itm.get("duration", "30 days"),
            food_instructions=itm.get("food_instructions", "after_food"),
            scheduled_timing=itm.get("scheduled_timing", ["09:00"]),
            confidence=itm.get("confidence", 0.92),
            clinical_notes=itm.get("clinical_notes"),
        ))
    db.commit()
    db.refresh(presc)
    return presc

@router.post("/confirm")
def confirm_prescription(
    data: PrescriptionConfirmRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    prescription = db.query(Prescription).filter(Prescription.id == data.prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    verify_resource_ownership(prescription.user_id, current_user.id, "Prescription")

    items_dicts = [item.model_dump() for item in data.medicines]
    created_meds = prescription_service.confirm_prescription_medicines(
        db=db,
        prescription_id=data.prescription_id,
        user_id=current_user.id,
        confirmed_items=items_dicts
    )

    return {
        "status": "success",
        "message": f"Confirmed {len(created_meds)} medicines. Schedules added to My Medicines.",
        "medicines_created": len(created_meds),
    }

@router.post("/{prescription_id}/confirm")
def confirm_prescription_by_id(
    prescription_id: str,
    payload: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    medicines = payload.get("medicines", [])
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prescription not found")
    verify_resource_ownership(prescription.user_id, current_user.id, "Prescription")

    created_meds = prescription_service.confirm_prescription_medicines(
        db=db,
        prescription_id=prescription_id,
        user_id=current_user.id,
        confirmed_items=medicines
    )

    return {
        "status": "success",
        "message": f"Confirmed {len(created_meds)} medicines.",
        "medicines_created": len(created_meds),
    }
