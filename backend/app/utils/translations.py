"""Translation utilities for extracting localized content."""


def get_translation(translations: dict | None, locale: str, fallback: str | None = None) -> str:
    """
    Extract translation from JSONB field with fallback logic.

    Fallback order: requested locale → English → first available → fallback string.

    Parameters
    ----------
    translations : dict | None
        JSONB translations dictionary with locale keys (en, fi, sv).
    locale : str
        Requested locale code (e.g., 'en', 'fi', 'sv').
    fallback : str | None
        Fallback string if no translation found.

    Returns
    -------
    str
        Translated text or fallback.

    """
    if not translations:
        return fallback or ""

    # Try requested locale
    if locale in translations and translations[locale]:
        return translations[locale]

    # Try English as default
    if "en" in translations and translations["en"]:
        return translations["en"]

    # Try any available translation
    for value in translations.values():
        if value:
            return value

    # Return fallback
    return fallback or ""


def apply_translations_to_product(product, locale: str = "en") -> None:
    """
    Apply translations to a product object in-place.

    Modifies the product's name, description, and short_description fields
    with translated values from the translation JSONB fields.

    Parameters
    ----------
    product
        Product ORM object.
    locale : str
        Requested locale code.

    """
    if product.name_translations:
        product.name = get_translation(
            product.name_translations,
            locale,
            fallback=product.name,
        )

    if product.description_translations:
        product.description = get_translation(
            product.description_translations,
            locale,
            fallback=product.description,
        )

    if product.short_description_translations:
        product.short_description = get_translation(
            product.short_description_translations,
            locale,
            fallback=product.short_description,
        )


def apply_translations_to_category(category, locale: str = "en") -> None:
    """
    Apply translations to a category object in-place.

    Modifies the category's name and description fields with translated
    values from the translation JSONB fields.

    Parameters
    ----------
    category
        Category ORM object.
    locale : str
        Requested locale code.

    """
    if category.name_translations:
        category.name = get_translation(
            category.name_translations,
            locale,
            fallback=category.name,
        )

    if category.description_translations:
        category.description = get_translation(
            category.description_translations,
            locale,
            fallback=category.description,
        )
