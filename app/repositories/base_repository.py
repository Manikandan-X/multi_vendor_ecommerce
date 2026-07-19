from typing import Generic, TypeVar
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")


class BaseRepository(Generic[ModelType]):

    def __init__(self, model: type[ModelType]):
        self.model = model

    def create(
        self,
        db: Session,
        obj: ModelType,
    ) -> ModelType:
        db.add(obj)
        db.flush()
        return obj

    def get_by_id(
        self,
        db: Session,
        obj_id: UUID,
    ) -> ModelType | None:
        return db.get(self.model, obj_id)

    def get_all(
        self,
        db: Session,
    ) -> list[ModelType]:
        statement = select(self.model)
        result = db.execute(statement)
        return list(result.scalars().all())

    def delete(
        self,
        db: Session,
        obj: ModelType,
    ) -> None:
        db.delete(obj)