from typing import Tuple, List, Dict, Any
from pydantic import BaseModel


def paginate(query, page: int = 1, limit: int = 20) -> Tuple[List, Dict]:
    """Paginate query results"""
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    return items, {
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit
    }


class PaginationResponse(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
