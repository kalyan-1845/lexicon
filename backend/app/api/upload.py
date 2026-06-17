from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.concurrency import run_in_threadpool
import fitz  # PyMuPDF
import os
import shutil
import asyncio
from typing import List

from app.api.schemas import DeleteFileResponse, UploadPDFResponse

router = APIRouter()

# Temporary storage directory for uploaded PDFs
UPLOAD_DIR = "app/storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
THUMBNAIL_DIR = "app/storage/thumbnails"
os.makedirs(THUMBNAIL_DIR, exist_ok=True)

@router.delete(
    "/delete/{filename}",
    response_model=DeleteFileResponse,
    summary="Delete an uploaded file",
    description="Removes an uploaded PDF from the workspace's storage library by its filename.",
    responses={
        404: {"description": "File not found in the storage directory"}
    }
)
async def delete_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return DeleteFileResponse(message=f"File {filename} deleted successfully")
    raise HTTPException(status_code=404, detail="File not found")

async def process_single_pdf(file: UploadFile):
    if not file.filename.endswith('.pdf'):
        return {
            "filename": file.filename,
            "status": "error",
            "status_code": 400,
            "detail": "Only PDF files are allowed"
        }
    
    # 10MB limit
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    try:
        pdf_bytes = await file.read()
        if len(pdf_bytes) > MAX_FILE_SIZE:
            return {
                "filename": file.filename,
                "status": "error",
                "status_code": 413,
                "detail": "File size exceeds 10MB limit"
            }
        
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        thumbnail_name = f"{file.filename}.png"
        thumbnail_path = os.path.join(THUMBNAIL_DIR, thumbnail_name)

        def process_pdf_io(path, thumb_path, content):
            with open(path, "wb") as f:
                f.write(content)
            d = fitz.open(path)
            extracted = ""
            for page in d:
                extracted += page.get_text()
            if len(d) > 0:
                first_page = d[0]
                pix = first_page.get_pixmap(matrix=fitz.Matrix(0.3, 0.3))
                pix.save(thumb_path)
            d.close()
            return extracted

        extracted_text = await run_in_threadpool(process_pdf_io, file_path, thumbnail_path, pdf_bytes)
        
        ocr_status = "Skipped (Searchable)"
        if "scanned" in file.filename.lower():
            ocr_status = "Success (OCR Applied)"
            
        return {
            "filename": file.filename,
            "status": "success",
            "status_code": 200,
            "ocr_status": ocr_status,
            "extracted_character_count": len(extracted_text),
            "full_text": extracted_text,
            "thumbnail": thumbnail_name,
            "preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
        }
    except Exception as e:
        return {
            "filename": file.filename,
            "status": "error",
            "status_code": 500,
            "detail": f"An error occurred while processing the PDF: {str(e)}"
        }
    finally:
        await file.close()

@router.post(
    "/pdf",
    response_model=UploadPDFResponse,
    summary="Upload and parse a PDF document",
    description="Uploads a PDF file, extracts its text content in-memory, and checks for scanned text formatting (applying mock OCR).",
    responses={
        400: {"description": "Invalid file type. Only PDF files are allowed."},
        500: {"description": "Internal server error during PDF parsing."}
    }
)
async def upload_file(file: UploadFile = File(...)):
    result = await process_single_pdf(file)
    if result["status"] == "error":
        raise HTTPException(status_code=result["status_code"], detail=result["detail"])
    return result

@router.post(
    "/batch",
    summary="Upload and parse multiple PDF documents in parallel",
    description="Uploads multiple PDF files, processes them in parallel, and returns execution status for each file.",
)
async def upload_batch(files: List[UploadFile] = File(...)):
    tasks = [process_single_pdf(file) for file in files]
    results = await asyncio.gather(*tasks)
    return {"results": results}
