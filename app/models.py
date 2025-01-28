from sqlalchemy import Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base, Mapped, mapped_column
from sqlalchemy.sql import func
from typing import Optional, List

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)

    topics: Mapped[List['Topic']] = relationship("Topic", back_populates="user", cascade="all, delete-orphan")


class Topic(Base):
    __tablename__ = 'topics'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'), nullable=False)

    user: Mapped[User] = relationship("User", back_populates="topics")
    posts: Mapped[List['Post']] = relationship("Post", back_populates="topic", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = 'posts'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    topic_id: Mapped[int] = mapped_column(Integer, ForeignKey('topics.id'), nullable=False)
    text: Mapped[str] = mapped_column(String, nullable=False)
    photo: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    pinned: Mapped[bool] = mapped_column(Boolean, default=False)

    topic: Mapped[Topic] = relationship("Topic", back_populates="posts")

