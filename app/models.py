from sqlalchemy import Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base, Mapped, mapped_column, validates
from sqlalchemy.sql import func
from typing import Optional, List
from flask_login import UserMixin

Base = declarative_base()


class User(Base, UserMixin):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)

    topics: Mapped[List['Topic']] = relationship("Topic", back_populates="user", cascade="all, delete-orphan")
    posts: Mapped[List['Post']] = relationship("Post", back_populates="user", cascade="all, delete-orphan")

    def is_active(self):
        return True

    def get_id(self):
        return str(self.id)

    def is_authenticated(self):
        return True

    def is_anonymous(self):
        return False

class Topic(Base):
    __tablename__ = 'topics'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(length=33), unique=True, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)

    user: Mapped[User] = relationship("User", back_populates="topics")
    posts: Mapped[List['Post']] = relationship("Post", back_populates="topic", cascade="all, delete-orphan")

    @validates('name')
    def validate_name(self, key, value):
        if len(value) > 22:
            raise ValueError("Name cannot be longer than 100 characters")
        return value

class Post(Base):
    __tablename__ = 'posts'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)
    topic_id: Mapped[int] = mapped_column(Integer, ForeignKey('topics.id'), nullable=False)
    text: Mapped[str] = mapped_column(String, nullable=False)
    photo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    pinned: Mapped[bool] = mapped_column(Boolean, default=False)

    topic: Mapped[Topic] = relationship("Topic", back_populates="posts")
    user: Mapped[User] = relationship("User", back_populates="posts")
