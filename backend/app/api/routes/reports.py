from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import User, ReportAnalysis, MedicalDocument
from app.schemas.schemas import ReportAnalysisResponse
from app.api.dependencies import get_current_active_user
from app.core.permissions import verify_resource_ownership
from app.services.report_service import report_service

router = APIRouter(prefix="/reports", tags=["Report Analysis"])

@router.get("/", response_model=List[ReportAnalysisResponse])
@router.get("/history", response_model=List[ReportAnalysisResponse])
def list_reports(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    reports = db.query(ReportAnalysis).filter(
        ReportAnalysis.user_id == current_user.id
    ).order_by(ReportAnalysis.created_at.desc()).all()
    return reports

@router.post("/analyze", response_model=ReportAnalysisResponse)
def analyze_report(
    payload: dict,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    document_id = payload.get("document_id")
    if not document_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="document_id required")

    doc = db.query(MedicalDocument).filter(MedicalDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    verify_resource_ownership(doc.user_id, current_user.id, "Document")

    # Get raw text from extracted data
    extracted_text = doc.extracted_data.raw_text if doc.extracted_data else ""
    analysis_dict = report_service.analyze_lab_report(extracted_text)

    analysis = ReportAnalysis(
        user_id=current_user.id,
        document_id=doc.id,
        report_type="Laboratory Evaluation",
        report_date="Current",
        laboratory_name="MediNova Health Diagnostics",
        overall_summary=analysis_dict["overall_summary"],
        key_findings=analysis_dict["key_findings"],
        abnormal_findings=analysis_dict["abnormal_findings"],
        questions_for_doctor=analysis_dict["questions_for_doctor"],
        plain_language_explanation=analysis_dict.get("plain_language_explanation"),
        historical_comparison=analysis_dict.get("historical_comparison", {}),
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis

@router.get("/{report_id}", response_model=ReportAnalysisResponse)
def get_report(
    report_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    report = db.query(ReportAnalysis).filter(ReportAnalysis.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report analysis not found")
    verify_resource_ownership(report.user_id, current_user.id, "Report Analysis")
    return report
