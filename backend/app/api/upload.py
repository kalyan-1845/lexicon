from fastapi import APIRouter, File, UploadFile, HTTPException
import fitz  # PyMuPDF
import os
import shutil

router = APIRouter()

# Temporary storage directory for uploaded PDFs
UPLOAD_DIR = "app/storage/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        # Save the uploaded file locally
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        extracted_text = ""
        filename = file.filename.lower()

        if filename.endswith('.pdf'):
            # Extract text using PyMuPDF
            doc = fitz.open(file_path)
            for page in doc:
                extracted_text += page.get_text()
        elif filename.endswith('.md') or filename.endswith('.txt'):
            # Read text directly
            with open(file_path, "r", encoding="utf-8") as f:
                extracted_text = f.read()
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Use .pdf, .md, or .txt")
            
        return {
            "filename": file.filename,
            "status": "success",
            "message": "File successfully parsed.",
            "extracted_character_count": len(extracted_text),
            "full_text": extracted_text,
            "preview": extracted_text[:200] + "..." if len(extracted_text) > 200 else extracted_text
        }
        
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    finally:
        file.file.close()
