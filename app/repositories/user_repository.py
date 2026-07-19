from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):

    def __init__(self):
        super().__init__(User)

    def get_by_email(
        self,
        db: Session,
        email: str,
    ) -> User | None:

        statement = select(User).where(User.email == email)

        result = db.execute(statement)

        return result.scalar_one_or_none()