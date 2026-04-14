"""Address endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.address import Address
from app.models.user import User
from app.schemas.address import AddressCreate, AddressResponse, AddressUpdate

router = APIRouter()


@router.get("", response_model=list[AddressResponse])
def list_addresses(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[Address]:
    """
    List current user's addresses.

    Parameters
    ----------
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    list[Address]
        User's addresses.

    """
    return (
        db.query(Address)
        .filter(Address.user_id == current_user.id)
        .order_by(
            Address.is_default_shipping.desc(),
            Address.created_at.desc(),
        )
        .all()
    )


@router.post(
    "", response_model=AddressResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_address(
    address_data: AddressCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Address:
    """
    Create a new address.

    Parameters
    ----------
    address_data : AddressCreate
        Address data.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    Address
        Created address.

    """
    if address_data.is_default_shipping:
        db.query(Address).filter(
            Address.user_id == current_user.id,
        ).update({"is_default_shipping": False})

    if address_data.is_default_billing:
        db.query(Address).filter(
            Address.user_id == current_user.id,
        ).update({"is_default_billing": False})

    new_address = Address(
        user_id=current_user.id,
        **address_data.model_dump(),
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address


@router.get("/{address_id}", response_model=AddressResponse)
def get_address(
    address_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Address:
    """
    Get address by ID.

    Parameters
    ----------
    address_id : int
        Address ID.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    Address
        Address details.

    Raises
    ------
    HTTPException
        If address not found or not owned by user.

    """
    address = (
        db.query(Address)
        .filter(
            Address.id == address_id,
            Address.user_id == current_user.id,
        )
        .first()
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )
    return address


@router.patch("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    address_data: AddressUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Address:
    """
    Update an address.

    Parameters
    ----------
    address_id : int
        Address ID.
    address_data : AddressUpdate
        Address update data.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Returns
    -------
    Address
        Updated address.

    Raises
    ------
    HTTPException
        If address not found or not owned by user.

    """
    address = (
        db.query(Address)
        .filter(
            Address.id == address_id,
            Address.user_id == current_user.id,
        )
        .first()
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    update_data = address_data.model_dump(exclude_unset=True)

    if update_data.get("is_default_shipping"):
        db.query(Address).filter(
            Address.user_id == current_user.id,
            Address.id != address_id,
        ).update({"is_default_shipping": False})

    if update_data.get("is_default_billing"):
        db.query(Address).filter(
            Address.user_id == current_user.id,
            Address.id != address_id,
        ).update({"is_default_billing": False})

    for field, value in update_data.items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address


@router.delete(
    "/{address_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_address(
    address_id: int,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> None:
    """
    Delete an address.

    Parameters
    ----------
    address_id : int
        Address ID.
    db : Session
        Database session.
    current_user : User
        Current authenticated user.

    Raises
    ------
    HTTPException
        If address not found or not owned by user.

    """
    address = (
        db.query(Address)
        .filter(
            Address.id == address_id,
            Address.user_id == current_user.id,
        )
        .first()
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found",
        )

    db.delete(address)
    db.commit()
