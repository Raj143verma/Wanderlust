// Select all filter buttons - adapting selector to match the existing UI elements correctly
const filterButtons = document.querySelectorAll('.filter');
const listingsGrid = document.querySelector('.row-cols-lg-3');

// Add click event to filter buttons
filterButtons.forEach(button => {
  // Grab text from inner p tag to match what the filter is 
  const p = button.querySelector('p');
  const buttonText = p ? p.textContent.trim() : button.textContent.trim();
  const validCategories = ['Trending', 'Rooms', 'Iconic Cities', 'Mountains', 'Beach', 'Castles', 'Artic', 'Camping', 'Farmland', 'Domes'];
  
  if (validCategories.includes(buttonText)) {
    button.addEventListener('click', async () => {
      try {
        // Show loading
        listingsGrid.innerHTML = '<p style="width: 100%; text-align: center; grid-column: 1 / -1;">Loading...</p>';
        
        // Fetch listings by category
        const response = await fetch(`/api/listings?category=${encodeURIComponent(buttonText)}`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
          // Clear grid
          listingsGrid.innerHTML = '';
          
          // Render listings
          result.data.forEach(listing => {
            const cardLink = document.createElement('a');
            cardLink.href = `/listings/${listing._id}`;
            cardLink.className = 'listing-link col';
            
            // Rebuild exactly identically as the server rendered cards 
            // So Button Design/UI remains exactly the same!
            
            let imageUrl = listing.image?.url || listing.image || '';
            let price = listing.price ? listing.price.toLocaleString("en-IN") : 'N/A';
            
            cardLink.innerHTML = `
                <div class="card listing-card" >
                  <img src="${imageUrl}" class="card-img-top" alt="listing_image" style="height: 20rem; object-fit: cover;">
                   <div class="card-img-overlay"></div>
                  <div class="card-body">
                    <p class="card-text">
                      ${listing.title} <br />
                        &#8377;${price} /night
                        <i class="tax-info" style="display: none;">&nbsp; &nbsp;+18% Gst</i>
                    </p>
                  </div>
                </div>
            `;
            listingsGrid.appendChild(cardLink);
          });
          
          // Reactivate tax toggles if the toggle switch is on
          let taxToggle = document.getElementById('switchCheckDefault');
          if (taxToggle && taxToggle.checked) {
              let taxInfo = document.getElementsByClassName('tax-info');
              for(let info of taxInfo) {
                info.style.display = 'inline';
              }
          }

        } else {
          listingsGrid.innerHTML = '<p style="width: 100%; text-align: center; grid-column: 1 / -1; margin-top: 2rem;">No listings found</p>';
        }
      } catch (error) {
        listingsGrid.innerHTML = '<p style="width: 100%; text-align: center; grid-column: 1 / -1; color: red;">Error loading listings</p>';
        console.error('Error:', error);
      }
    });
  }
});

console.log('✅ Filter functionality loaded');
