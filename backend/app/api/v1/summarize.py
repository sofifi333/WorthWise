"""
Summarize Endpoints
AI-powered summarization of ROI analysis using HuggingFace Inference API
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
import os
import logging
import httpx
from typing import Optional
from app.database import get_db
from app.schemas.summarize import SummarizeRequest, SummarizeResponse
from app.models import Institution, CIPCode

logger = logging.getLogger(__name__)

router = APIRouter()

# HuggingFace service URL - load from environment with fallback
HF_SERVICE_URL = os.environ.get("HF_SERVICE_URL")


def handle_huggingface_error(error: Exception, service_name: str = "HuggingFace service"):
    """Handle common HuggingFace service errors with appropriate HTTP responses."""
    if isinstance(error, httpx.HTTPStatusError):
        logger.error(f"{service_name} error: {error.response.status_code} - {error.response.text}")
        raise HTTPException(
            status_code=502,
            detail=f"{service_name} error: {str(error)}"
        )
    elif isinstance(error, httpx.RequestError):
        logger.error(f"Failed to connect to {service_name}: {str(error)}")
        raise HTTPException(
            status_code=503,
            detail=f"{service_name} unavailable. Please ensure the service is running at {HF_SERVICE_URL}"
        )
    else:
        logger.error(f"Unexpected error in {service_name}: {str(error)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(error)}"
        )

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_roi(
    request: SummarizeRequest,
    db: Session = Depends(get_db)
):
    """
    Generate AI-powered summary of ROI analysis with rating
    
    Calls the HuggingFace inference service to generate a summary
    based on financial data (tuition, earnings, ROI).
    
    This endpoint provides insights into:
    - Financial investment required
    - Earning potential and career growth
    - Return on investment analysis
    - Overall financial feasibility assessment with 1-5 star rating
    """
    try:
        # Call HuggingFace service
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{HF_SERVICE_URL}/summarize",
                json=request.model_dump(),
            )
            response.raise_for_status()
            result = response.json()
            
            return SummarizeResponse(
                summary=result["summary"],
                rating=result["rating"]
            )

    except Exception as e:
        handle_huggingface_error(e)


@router.post("/summarize-from-compute", response_model=SummarizeResponse)
async def summarize_from_compute(
    institution_id: int,
    cip_code: str,
    db: Session = Depends(get_db)
):
    """
    Generate summary from compute result data
    
    Fetches institution and major names from database, then calls
    the compute endpoint to get KPIs, and finally generates a summary.
    This is a convenience endpoint that combines compute + summarize.
    """
    try:
        # Get institution and major names
        institution = db.query(Institution).filter(
            Institution.id == institution_id
        ).first()
        
        cip = db.query(CIPCode).filter(
            CIPCode.cip_code == cip_code
        ).first()
        
        if not institution:
            raise HTTPException(status_code=404, detail=f"Institution {institution_id} not found")
        
        if not cip:
            raise HTTPException(status_code=404, detail=f"Major {cip_code} not found")
        
        # Get tuition (use in-state or out-of-state based on availability)
        tuition_fees = institution.tuition_in_state or institution.tuition_out_state or 0
        
        # Create summarize request (user should call compute first to get actual KPIs)
        # This endpoint is a helper, but ideally the frontend should call compute first
        # and then pass the actual KPI values to /summarize
        
        raise HTTPException(
            status_code=400,
            detail="Please use /summarize endpoint with actual KPI values from /compute endpoint"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in summarize_from_compute: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate summary: {str(e)}"
        )
