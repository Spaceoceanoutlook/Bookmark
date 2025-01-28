from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from typing import Optional

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id: int = Column(Integer, primary_key=True, index=True)
    email: str = Column(String, unique=True, index=True, nullable=False)
    password: str = Column(String, nullable=False)

    topics: list['Topic'] = relationship("Topic", back_populates="user", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = 'topics'
    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String, index=True, nullable=False)
    user_id: int = Column(Integer, ForeignKey('users.id'), nullable=False)

    user: User = relationship("User", back_populates="topics")
    posts: list['Post'] = relationship("Post", back_populates="topic", cascade="all, delete-orphan")

class Post(Base):
    __tablename__ = 'posts'
    id: int = Column(Integer, primary_key=True, index=True)
    topic_id: int = Column(Integer, ForeignKey('topics.id'), nullable=False)
    text: str = Column(String, nullable=False)
    photo: Optional[str] = Column(String, nullable=True)
    created_at: DateTime = Column(DateTime(timezone=True), server_default=func.now())
    pinned: bool = Column(Boolean, default=False)

    topic: Topic = relationship("Topic", back_populates="posts")
