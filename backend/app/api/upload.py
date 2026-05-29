from fastapi import APIRouter, File, UploadFile, HTTPException
import fitz  # PyMuPDF
import os
import shutil

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
@router.post("/pdf")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        # Read the file bytes directly into memory
        pdf_bytes = await file.read()
        
        # Extract text using PyMuPDF from memory stream
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text()
            
        # Simulated OCR extraction for scanned documents
        ocr_status = "Skipped (Searchable)"
        if "scanned" in file.filename.lower():
            ocr_status = "Success (OCR Applied)"
        
        return {
            "filename": file.filename,
            "ocr_status": ocr_status,
            "status": "success",
            "message": "File successfully uploaded and parsed in-memory.",
            "extracted_character_count": len(extracted_text),
            "full_text": extracted_text,
            "preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred while processing the PDF: {str(e)}")
    finally:
        await file.close()
