// Mobile Zone storefront demo. Replace STORE_WHATSAPP with your WhatsApp number
// in international format without + or spaces, e.g. 923001234567.
const STORE_WHATSAPP = "";
const products = [
  {id:1,name:"Matte Shield Phone Case",category:"Cases",price:1299,old:1599,symbol:"▣",badge:"BESTSELLER",tone:1},
  {id:2,name:"20W Fast Wall Charger",category:"Charging",price:2499,old:0,symbol:"ϟ",badge:"POPULAR",tone:2},
  {id:3,name:"Wireless Earbuds",category:"Audio",price:3999,old:4499,symbol:"♫",badge:"SAVE 11%",tone:3},
  {id:4,name:"Classic Smart Watch",category:"Wearables",price:5999,old:0,symbol:"◷",badge:"NEW",tone:4},
  {id:5,name:"Braided USB-C Cable",category:"Charging",price:899,old:0,symbol:"⌁",badge:"",tone:1},
  {id:6,name:"Clear Grip Case",category:"Cases",price:1099,old:1299,symbol:"▤",badge:"NEW",tone:2},
  {id:7,name:"Wireless Neckband",category:"Audio",price:2799,old:0,symbol:"⌁",badge:"",tone:4},
  {id:8,name:"10,000mAh Power Bank",category:"Charging",price:4499,old:4999,symbol:"▰",badge:"POPULAR",tone:3}
];
const money = n => "Rs. " + Number(n).toLocaleString("en-PK");
let cart = JSON.parse(localStorage.getItem("mz-cart") || "[]");
let activeFilter = "All";
const grid = document.querySelector("#product-grid");
const cartDrawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#overlay");
const toast = document.querySelector("#toast");
let toastTimer;
function notify(message){toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2300)}
function renderProducts(){
  const query=document.querySelector("#search").value.trim().toLowerCase();
  let list=products.filter(p=>(activeFilter==="All"||p.category===activeFilter)&&(p.name+" "+p.category).toLowerCase().includes(query));
  const sort=document.querySelector("#sort").value;
  if(sort==="low")list.sort((a,b)=>a.price-b.price);if(sort==="high")list.sort((a,b)=>b.price-a.price);
  grid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-visual tone-${p.tone}">${p.badge?`<span class="product-badge">${p.badge}</span>`:""}<span class="product-symbol">${p.symbol}</span><button class="quick-add" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div><div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><span class="product-price">${money(p.price)} ${p.old?`<del>${money(p.old)}</del>`:""}</span></div></article>`).join("");
  document.querySelector("#empty-state").hidden=list.length>0;
}
function saveCart(){localStorage.setItem("mz-cart",JSON.stringify(cart));renderCart()}
function addToCart(id){const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});saveCart();notify("Added to your bag")}
function changeQty(id,delta){const item=cart.find(x=>x.id===id);if(!item)return;item.qty+=delta;if(item.qty<1)cart=cart.filter(x=>x.id!==id);saveCart()}
function renderCart(){
  const count=cart.reduce((n,x)=>n+x.qty,0),total=cart.reduce((n,x)=>n+x.qty*products.find(p=>p.id===x.id).price,0);
  document.querySelector("#cart-count").textContent=count;document.querySelector("#drawer-count").textContent=`(${count})`;document.querySelector("#subtotal").textContent=money(total);document.querySelector("#checkout-total").textContent=money(total);
  document.querySelector("#cart-items").innerHTML=cart.length?cart.map(x=>{const p=products.find(y=>y.id===x.id);return `<div class="cart-line"><div class="cart-thumb">${p.symbol}</div><div><h4>${p.name}</h4><small>${money(p.price)}</small><div class="quantity"><button data-qty="${p.id}" data-delta="-1">−</button><span>${x.qty}</span><button data-qty="${p.id}" data-delta="1">+</button></div></div><button class="remove-item" data-remove="${p.id}" aria-label="Remove ${p.name}">×</button></div>`}).join(""):`<p class="cart-empty">Your bag is waiting for something good.</p>`;
}
function openCart(){cartDrawer.classList.add("open");overlay.classList.add("show");cartDrawer.setAttribute("aria-hidden","false")}
function closeCart(){cartDrawer.classList.remove("open");overlay.classList.remove("show");cartDrawer.setAttribute("aria-hidden","true")}
document.addEventListener("click",e=>{
  const add=e.target.closest("[data-add]");if(add)addToCart(Number(add.dataset.add));
  const qty=e.target.closest("[data-qty]");if(qty)changeQty(Number(qty.dataset.qty),Number(qty.dataset.delta));
  const remove=e.target.closest("[data-remove]");if(remove){cart=cart.filter(x=>x.id!==Number(remove.dataset.remove));saveCart()}
});
document.querySelector("#filters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;activeFilter=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
document.querySelectorAll(".category-card").forEach(b=>b.addEventListener("click",()=>{activeFilter=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x.dataset.filter===activeFilter));renderProducts();document.querySelector("#shop").scrollIntoView({behavior:"smooth"})}));
document.querySelector("#search").addEventListener("input",renderProducts);document.querySelector("#sort").addEventListener("change",renderProducts);
document.querySelector("#open-cart").addEventListener("click",openCart);document.querySelector("#close-cart").addEventListener("click",closeCart);overlay.addEventListener("click",closeCart);
document.querySelector("#checkout-button").addEventListener("click",()=>{if(!cart.length){notify("Your bag is empty");return}closeCart();document.querySelector("#checkout-modal").classList.add("show")});
document.querySelector("#close-checkout").addEventListener("click",()=>document.querySelector("#checkout-modal").classList.remove("show"));
document.querySelector("#checkout-modal").addEventListener("click",e=>{if(e.target.id==="checkout-modal")e.currentTarget.classList.remove("show")});
document.querySelector("#checkout-form").addEventListener("submit",e=>{
  e.preventDefault();if(!cart.length)return;
  const data=Object.fromEntries(new FormData(e.currentTarget).entries());
  const lines=cart.map(x=>{const p=products.find(y=>y.id===x.id);return `${p.name} x ${x.qty} — ${money(p.price*x.qty)}`});
  const total=cart.reduce((n,x)=>n+x.qty*products.find(p=>p.id===x.id).price,0);
  const message=`Hello Mobile Zone! I'd like to place an order:\n\n${lines.join("\n")}\n\nTotal: ${money(total)}\nPayment: ${data.payment}\n\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email||"Not provided"}\nAddress: ${data.address}\nNote: ${data.note||"None"}`;
  if(STORE_WHATSAPP){window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`,"_blank","noopener");}
  else {const blob=new Blob([message],{type:"text/plain"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="mobile-zone-order.txt";a.click();URL.revokeObjectURL(url);notify("Order summary downloaded. Add your WhatsApp number to enable sending.");}
  cart=[];saveCart();e.currentTarget.reset();document.querySelector("#checkout-modal").classList.remove("show");
});
document.querySelector("#menu-toggle").addEventListener("click",()=>document.querySelector(".desktop-nav").classList.toggle("open"));
document.querySelectorAll(".desktop-nav a").forEach(a=>a.addEventListener("click",()=>document.querySelector(".desktop-nav").classList.remove("open")));
document.querySelector("#year").textContent=new Date().getFullYear();
document.querySelector("#footer-whatsapp").href=STORE_WHATSAPP?`https://wa.me/${STORE_WHATSAPP}`:"#";
renderProducts();renderCart();
