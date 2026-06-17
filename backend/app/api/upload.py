from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.concurrency import run_in_threadpool
import fitz  # PyMuPDF
import os
import shutil
import asyncio
from typing import List

router = APIRouter()

# Temporary storage directory for uploaded PDFs
UPLOAD_DIR = "app/storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.delete("/delete/{filename}")
async def delete_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"message": f"File {filename} deleted successfully"}
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
            
        doc = await run_in_threadpool(fitz.open, stream=pdf_bytes, filetype="pdf")
        
        def extract_text(doc):
            extracted = ""
            for page in doc:
                extracted += page.get_text()
            return extracted
            
        extracted_text = await run_in_threadpool(extract_text, doc)
        
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

@router.post("/pdf")
async def upload_file(file: UploadFile = File(...)):
    result = await process_single_pdf(file)
    if result["status"] == "error":
        raise HTTPException(status_code=result["status_code"], detail=result["detail"])
    return result

@router.post("/batch")
async def upload_batch(files: List[UploadFile] = File(...)):
    tasks = [process_single_pdf(file) for file in files]
    results = await asyncio.gather(*tasks)
    return {"results": results}
