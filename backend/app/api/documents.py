from fastapi import APIRouter

router = APIRouter()

DOCUMENTS = []

@router.get("/")
def get_documents():
    return {"documents": DOCUMENTS}


@router.post("/add")
def add_document(doc: dict):
    DOCUMENTS.append(doc)
    return {"status": "added"}