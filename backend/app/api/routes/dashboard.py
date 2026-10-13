from datetime import datetime, date, timezone
from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.all_models import (
    User, Medicine, MedicationSchedule, MedicationDoseEvent,
    MedicalDocument, ReportAnalysis, Appointment
)
from app.api.dependencies import get_current_active_user
from app.services.adherence_service import adherence_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    today = date.today()
    today_str = today.isoformat()
    now_time = datetime.now().strftime("%H:%M")

    # 1. Active Medicines
    medicines = db.query(Medicine).filter(
        Medicine.user_id == current_user.id,
        Medicine.status == "active"
    ).all()

    # 2. Today's Dose Events
    today_events = db.query(MedicationDoseEvent).filter(
        MedicationDoseEvent.user_id == current_user.id,
        MedicationDoseEvent.scheduled_date == today_str
    ).all()

    taken_count = len([e for e in today_events if e.status == "taken"])
    skipped_count = len([e for e in today_events if e.status == "skipped"])

    # Build today's schedule items from medicines
    schedule_items = []
    next_medicine = None
    remaining_count = 0

    for med in medicines:
        for slot in (med.time_slots or ["09:00"]):
            # Check if event already exists
            ev = next((e for e in today_events if e.medicine_id == med.id and e.scheduled_time == slot), None)
            is_taken = ev is not None and ev.status == "taken"
            is_skipped = ev is not None and ev.status == "skipped"

            status_str = "taken" if is_taken else ("skipped" if is_skipped else "pending")
            if status_str == "pending":
                remaining_count += 1
                if next_medicine is None and slot >= now_time:
                    next_medicine = {
                        "medicine_id": med.id,
                        "name": med.name,
                        "dose": med.prescribed_dose,
                        "time": slot,
                        "food_instructions": med.food_instructions,
                    }

            schedule_items.append({
                "medicine_id": med.id,
                "name": med.name,
                "strength": med.strength,
                "prescribed_dose": med.prescribed_dose,
                "scheduled_time": slot,
                "food_instructions": med.food_instructions,
                "status": status_str,
            })

    # If all slots earlier than now, pick the first pending
    if next_medicine is None and schedule_items:
        first_pending = next((item for item in schedule_items if item["status"] == "pending"), None)
        if first_pending:
            next_medicine = {
                "medicine_id": first_pending["medicine_id"],
                "name": first_pending["name"],
                "dose": first_pending["prescribed_dose"],
                "time": first_pending["scheduled_time"],
                "food_instructions": first_pending["food_instructions"],
            }

    # 3. Adherence Stats
    adherence = adherence_service.calculate_adherence(db, current_user.id)

    # 4. Recent Documents
    recent_docs = db.query(MedicalDocument).filter(
        MedicalDocument.user_id == current_user.id
    ).order_by(MedicalDocument.upload_timestamp.desc()).limit(5).all()

    # 5. Recent Report Analysis
    recent_reports = db.query(ReportAnalysis).filter(
        ReportAnalysis.user_id == current_user.id
    ).order_by(ReportAnalysis.created_at.desc()).limit(3).all()

    # 6. Upcoming Appointments
    upcoming_appts = db.query(Appointment).filter(
        Appointment.user_id == current_user.id,
        Appointment.status == "confirmed"
    ).order_by(Appointment.appointment_date.asc(), Appointment.start_time.asc()).limit(3).all()

    # 7. Activity Timeline Items
    activity_timeline = []
    for ev in today_events:
        med_obj = db.query(Medicine).filter(Medicine.id == ev.medicine_id).first()
        activity_timeline.append({
            "type": "dose",
            "title": f"Dose {ev.status.capitalize()}: {med_obj.name if med_obj else 'Medicine'}",
            "time": ev.scheduled_time,
            "status": ev.status,
            "timestamp": ev.action_timestamp.isoformat() if ev.action_timestamp else today_str,
        })
    for appt in upcoming_appts:
        activity_timeline.append({
            "type": "appointment",
            "title": f"Appointment Booked: {appt.doctor.name if appt.doctor else 'Doctor'}",
            "time": f"{appt.appointment_date} at {appt.start_time}",
            "status": appt.status,
            "timestamp": appt.created_at.isoformat() if appt.created_at else today_str,
        })

    # 8. Health Task Checklist
    checklist = [
        {"id": "take_morning_dose", "title": "Take scheduled morning medications", "completed": taken_count > 0},
        {"id": "review_reports", "title": "Review latest lab diagnostic report", "completed": len(recent_reports) > 0},
        {"id": "hydrate_vitals", "title": "Hydrate & record physical vitals", "completed": True},
        {"id": "doctor_followup", "title": "Check appointment preparation notes", "completed": len(upcoming_appts) > 0},
    ]

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
        },
        "today_schedule": schedule_items,
        "next_medicine": next_medicine,
        "metrics": {
            "taken_count": taken_count,
            "remaining_count": remaining_count,
            "skipped_count": skipped_count,
            "total_today": len(schedule_items),
            "adherence_today_percentage": adherence.get("today_percentage", 100.0),
            "adherence_weekly_percentage": adherence.get("weekly_percentage", 100.0),
            "adherence_monthly_percentage": adherence.get("monthly_percentage", 100.0),
        },
        "adherence": adherence,
        "recent_documents": [
            {
                "id": d.id,
                "original_filename": d.original_filename,
                "document_type": d.document_type,
                "upload_timestamp": d.upload_timestamp.isoformat() if d.upload_timestamp else today_str,
                "processing_status": d.processing_status,
                "file_size": d.file_size,
            }
            for d in recent_docs
        ],
        "recent_reports": [
            {
                "id": r.id,
                "report_type": r.report_type,
                "report_date": r.report_date,
                "overall_summary": r.overall_summary,
                "abnormal_findings_count": len(r.abnormal_findings or []),
            }
            for r in recent_reports
        ],
        "upcoming_appointments": [
            {
                "id": a.id,
                "doctor_name": a.doctor.name if a.doctor else "Doctor",
                "doctor_specialty": a.doctor.specialty if a.doctor else "Specialist",
                "appointment_date": a.appointment_date,
                "start_time": a.start_time,
                "consultation_type": a.consultation_type,
                "booking_reference": a.booking_reference,
            }
            for a in upcoming_appts
        ],
        "activity_timeline": activity_timeline,
        "health_checklist": checklist,
    }

@router.get("/adherence")
def get_dashboard_adherence(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return adherence_service.calculate_adherence(db, current_user.id)
