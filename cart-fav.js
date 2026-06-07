// ============================================================
// cart-fav.js – Shopping Cart, Favorites, Purchases & Offers
// Simple beginner-friendly implementation
// ============================================================

// ── Helper: Get current logged-in user ─────────────────────
function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function isLoggedIn() {
    return localStorage.getItem("isLoggedIn") === "true";
}

function redirectIfNotLoggedIn() {
    if (!isLoggedIn()) {
        alert("Please login first!");
        window.location.href = "LoginPage.html";
        return false;
    }
    return true;
}

// ── Favorites (per user) ────────────────────────────────────
function getFavoritesKey() {
    const user = getCurrentUser();
    return user ? `favorites_${user.email}` : null;
}

function getFavorites() {
    const key = getFavoritesKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
}

function addToFavorites(propertyId) {
    if (!redirectIfNotLoggedIn()) return false;
    const key = getFavoritesKey();
    let favs = getFavorites();
    if (!favs.includes(propertyId)) {
        favs.push(propertyId);
        localStorage.setItem(key, JSON.stringify(favs));
        return true;
    }
    return false;
}

function removeFromFavorites(propertyId) {
    const key = getFavoritesKey();
    if (!key) return;
    let favs = getFavorites();
    favs = favs.filter(id => id != propertyId);
    localStorage.setItem(key, JSON.stringify(favs));
}

function isFavorite(propertyId) {
    return getFavorites().includes(propertyId);
}

// ── Shopping Cart (per user) ────────────────────────────────
function getCartKey() {
    const user = getCurrentUser();
    return user ? `cart_${user.email}` : null;
}

function getCart() {
    const key = getCartKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
}

function addToCart(propertyId) {
    if (!redirectIfNotLoggedIn()) return false;
    const key = getCartKey();
    let cart = getCart();
    if (!cart.includes(propertyId)) {
        cart.push(propertyId);
        localStorage.setItem(key, JSON.stringify(cart));
        return true;
    }
    return false;
}

function removeFromCart(propertyId) {
    const key = getCartKey();
    if (!key) return;
    let cart = getCart();
    cart = cart.filter(id => id != propertyId);
    localStorage.setItem(key, JSON.stringify(cart));
}

function clearCart() {
    const key = getCartKey();
    if (key) localStorage.removeItem(key);
}

// ── Purchases (per user) ────────────────────────────────────
function getPurchasesKey() {
    const user = getCurrentUser();
    return user ? `purchases_${user.email}` : null;
}

function getPurchases() {
    const key = getPurchasesKey();
    if (!key) return [];
    return JSON.parse(localStorage.getItem(key)) || [];
}

function addPurchase(propertyId, price) {
    const key = getPurchasesKey();
    if (!key) return;
    let purchases = getPurchases();
    purchases.push({
        propertyId: propertyId,
        price: price,
        date: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(purchases));
}

// ── Offers (global, per property) ───────────────────────────
function getOffersKey(propertyId) {
    return `offers_property_${propertyId}`;
}

function getOffers(propertyId) {
    const key = getOffersKey(propertyId);
    return JSON.parse(localStorage.getItem(key)) || [];
}

function saveOffers(propertyId, offers) {
    localStorage.setItem(getOffersKey(propertyId), JSON.stringify(offers));
}

function addOffer(propertyId, buyerEmail, offerPrice) {
    const offers = getOffers(propertyId);
    const newOffer = {
        id: Date.now(),
        buyerEmail: buyerEmail,
        offerPrice: offerPrice,
        status: "pending", // pending, accepted, rejected, countered
        counterPrice: null,
        createdAt: new Date().toISOString()
    };
    offers.push(newOffer);
    saveOffers(propertyId, offers);
    return newOffer;
}

function updateOfferStatus(propertyId, offerId, status, counterPrice = null) {
    const offers = getOffers(propertyId);
    const offerIndex = offers.findIndex(o => o.id == offerId);
    if (offerIndex !== -1) {
        offers[offerIndex].status = status;
        if (counterPrice !== null) {
            offers[offerIndex].counterPrice = counterPrice;
        }
        saveOffers(propertyId, offers);
    }
}

// ── Helper: Get property by ID from global properties array ─
function getPropertyById(id) {
    return properties.find(p => p.id == id);
}

// ── Redirect to details page ────────────────────────────────
function goToPropertyDetails(propertyId) {
    window.location.href = `property-details.html?id=${propertyId}`;
}