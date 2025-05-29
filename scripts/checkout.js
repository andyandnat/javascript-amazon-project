import {
  cart,
  removeFromCart,
  calculateCartQuantity,
  updateQuantity
} from '../data/cart.js';
import {products} from '../data/products.js';
import {formatCurrency} from './utils/money.js';
import {deliveryOptions} from '../data/deliveryOption.js';
import {hello} from 'https://unpkg.com/supersimpledev@1.0.1/hello.esm.js';
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js';

 

console.log('cart:', cart); 
console.log('products:', products);
console.log('calculateCartQuantity():', calculateCartQuantity())

hello();

function deliveryOptionsHTML(productId, selectedDeliveryOptionId) {
  return deliveryOptions.map((deliveryOption, index) => {
    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');

    const priceString = deliveryOption.priceCents === 0
      ? 'FREE'
      : `$${formatCurrency(deliveryOption.priceCents)} -`;
      
    return `
      <div class="delivery-option">
        <input type="radio"
          class="delivery-option-input"
          name="delivery-option-${productId}"
          ${deliveryOption.id.toString() === selectedDeliveryOptionId.toString() ? 'checked' : ''}
          value="${deliveryOption.id}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            ${priceString} Shipping
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Build cart summary HTML
let cartSummaryHTML = '';

cart.forEach(cartItem => {
  const matchingProduct = products.find(p => p.id === cartItem.productId);
  if (!matchingProduct) return; // skip if no product found

  cartSummaryHTML += `
    <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dayjs().add(7, 'days').format('dddd, MMMM D')}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image" src="${matchingProduct.image}" alt="${matchingProduct.name}">
        <div class="cart-item-details">
          <div class="product-name">${matchingProduct.name}</div>
          <div class="product-quantity">
            <span>
                Quantity: <span class="quantity-label js-quantity-label-${matchingProduct.id}">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">Update</span>
            <input class="quantity-input js-quantity-input-${matchingProduct.id}" type="number" min="0" max="999" value="${cartItem.quantity}">
            <span class="save-quantity-link link-primary js-save-link" data-product-id="${matchingProduct.id}">Save</span>
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">Delete</span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(matchingProduct.id, cartItem.deliveryOptionId)}
        </div>
      </div>
    </div>
  `;
});

document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

function updateCartQuantity() {
  const cartQuantity = calculateCartQuantity();
  const returnToHome = document.querySelector('.js-return-to-home-link');
  if (returnToHome) {
    returnToHome.textContent = `${cartQuantity} items`;
  }
}

updateCartQuantity();

// Event delegation for clicks inside the order summary container
document.querySelector('.js-order-summary').addEventListener('click', (event) => {
  const target = event.target;

  // Delete item
  if (target.classList.contains('js-delete-link')) {
    const productId = target.dataset.productId;
    removeFromCart(productId);

    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    if (container) container.remove();

    updateCartQuantity();
  }

  // Start editing quantity
  else if (target.classList.contains('js-update-link')) {
    const productId = target.dataset.productId;
    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    if (container) container.classList.add('is-editing-quantity');
  }

  // Save quantity
  else if (target.classList.contains('js-save-link')) {
    const productId = target.dataset.productId;
    const quantityInput = document.querySelector(`.js-quantity-input-${productId}`);

    if (!quantityInput) return;

    const newQuantity = Number(quantityInput.value);

    if (isNaN(newQuantity) || newQuantity < 0 || newQuantity >= 1000) {
      alert('Quantity must be a number, at least 0 and less than 1000');
      return;
    }

    updateQuantity(productId, newQuantity);

    const container = document.querySelector(`.js-cart-item-container-${productId}`);
    if (container) container.classList.remove('is-editing-quantity');

    const quantityLabel = document.querySelector(`.js-quantity-label-${productId}`);
    if (quantityLabel) quantityLabel.textContent = newQuantity;

    updateCartQuantity();
  }

  if (target.classList.contains('delivery-option-input')) {
  const productId = target.name.replace('delivery-option-', '');
  const selectedOptionId = target.value;

  // Update delivery date in DOM
  const selectedOption = deliveryOptions.find(option => option.id === selectedOptionId);
  const container = document.querySelector(`.js-cart-item-container-${productId}`);
  const deliveryDateElem = container.querySelector('.delivery-date');
  const newDate = dayjs().add(selectedOption.deliveryDays, 'days').format('dddd, MMMM D');
  deliveryDateElem.textContent = `Delivery date: ${newDate}`;

  // Update the cart data and save to localStorage
  const cartItem = cart.find(item => item.productId === productId);
  if (cartItem) {
    cartItem.deliveryOptionId = selectedOptionId;
    localStorage.setItem('cart', JSON.stringify(cart));
  }
}
});