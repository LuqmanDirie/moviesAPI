document.addEventListener('DOMContentLoaded', function () {

    let page = 1;
    const perPage = 10;

    // Function to load movie data from the API and update the DOM
    function loadMovieData(title = null) {
        let url = title
          ? `https://easy-gold-agouti-wear.cyclic.app/api/movies?page=${+page}&perPage=${+perPage}&title=${title}`
          : `https://easy-gold-agouti-wear.cyclic.app/api/movies?page=${+page}&perPage=${+perPage}`;
      
        let status = document.querySelector(".pagination");
      
        if (title) {
          status.classList.add("d-none");
        } else {
          status.classList.remove("d-none");
        }
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            let postRows = `
                  ${data
                    .map(
                      (post) =>
                        `<tr data-id=${post._id}>
                          <td>${post.year}</td>
                          <td>${post.title}</td>
                          <td>${post.plot}</td>
                          <td>${post.rated ? "N/A" : "R"}</td>
                          <td>${Math.floor(post.runtime / 60)} : ${(post.runtime % 60)
                          .toString()
                          .padStart(2, "0")}</td>
                      </tr>`
                    )
                    .join("")}
              `;
      
            document.querySelector("#moviesTable tbody").innerHTML = postRows;
      
            document.querySelector("#current-page").innerHTML = page;
      
            document.querySelectorAll("#moviesTable tbody tr").forEach((row) => {
              row.addEventListener("click", (e) => {
                let clickedID = row.getAttribute("data-id");
                console.log(clickedID);
      
                fetch(
                  `https://easy-gold-agouti-wear.cyclic.app/api/movies/${clickedID}`
                )
                  .then((res) => res.json())
                  .then((data) => {
                    console.log(data);
                    document.querySelector("#detailsModal .modal-title").innerHTML =
                      data.title;
                    let detailList = `
                                  <img class="img-fluid w-100" src="${
                                    data.poster
                                  }"><br><br>
                                  <strong>Directed By:</strong> ${data.directors
                                    .map((directors) => `${directors}`)
                                    .join(", ")}<br><br>
                                  <p> ${data.fullplot}</p>
                                  <strong>Cast:</strong> ${
                                    data.cast
                                      ? data.cast.map((cast) => `${cast}`).join(", ")
                                      : "N/A"
                                  }<br><br>
                                  <strong>Awards:</strong> ${data.awards.text}<br>
                                  <strong>IMDB Rating:</strong> ${
                                    data.imdb.rating
                                  } (${data.imdb.votes})
                                  `;
      
                    document.querySelector("#detailsModal .modal-body").innerHTML =
                      detailList;
      
                    let modal = new bootstrap.Modal(
                      document.getElementById("detailsModal"),
                      {
                        backdrop: "static",
                        keyboard: false,
                      }
                    );
      
                    modal.show();
                  });
              });
            });
          });
      }

    function updateTable(data) {
        const tableBody = document.querySelector('#moviesTable tbody');
        tableBody.innerHTML = data.map(movie => createTableRow(movie)).join('');
        document.querySelector('#current-page').textContent = page;
        attachRowClickEvents();
        
        // Enable or disable the previous page button
        const prevButton = document.querySelector('#previous-page');
        if (page > 1) {
            prevButton.classList.remove('disabled');
        } else {
            prevButton.classList.add('disabled');
        }
    }

    // Function to create a single table row
    function createTableRow(movie) {
        const hours = Math.floor(movie.runtime / 60);
        const minutes = (movie.runtime % 60).toString().padStart(2, '0');
        return `<tr data-id="${movie._id}">
                  <td>${movie.year}</td>
                  <td>${movie.title}</td>
                  <td>${movie.plot || 'N/A'}</td>
                  <td>${movie.rated || 'N/A'}</td>
                  <td>${hours}:${minutes}</td>
                </tr>`;
    }

    // Function to attach click events to table rows
    function attachRowClickEvents() {
        document.querySelectorAll('#moviesTable tbody tr').forEach(row => {
            row.addEventListener('click', function () {
                fetch(`/api/movies/${this.getAttribute('data-id')}`)
                .then(response => response.json())
                .then(movieData => showModal(movieData))
                .catch(error => console.error('Error:', error));
            });
        });
    }

    // Function to show modal with movie details
    function showModal(movieData) {
        document.querySelector('.modal-title').textContent = movieData.title;
        const modalBody = document.querySelector('.modal-body');
        modalBody.innerHTML = createModalContent(movieData);
        new bootstrap.Modal(document.getElementById('detailsModal')).show();
    }

    // Function to create modal content
    function createModalContent(movieData) {
        const img = movieData.poster ? `<img class="img-fluid w-100" src="${movieData.poster}">` : '';
        const directors = movieData.directors ? `<strong>Directed By:</strong> ${movieData.directors.join(', ')}` : '';
        const cast = movieData.cast ? `<strong>Cast:</strong> ${movieData.cast.join(', ')}` : '<strong>Cast:</strong> N/A';
        const awards = movieData.awards ? `<strong>Awards:</strong> ${movieData.awards.text}` : '<strong>Awards:</strong> N/A';
        const imdbRating = movieData.imdb ? `<strong>IMDB Rating:</strong> ${movieData.imdb.rating} (${movieData.imdb.votes} votes)` : '<strong>IMDB Rating:</strong> N/A';

        return `${img}
        <br><br>
        ${directors}
        <br><br>
        <p>${movieData.fullplot || movieData.plot || 'N/A'}</p>
        ${cast}
        <br><br>
        ${awards}
        <br>
        ${imdbRating}`;
    }

    // Event listener for previous page button
    document.querySelector('#previous-page').addEventListener('click', () => {
        if (page > 1) page--;
        loadMovieData();
    });

    // Event listener for next page button
    document.querySelector('#next-page').addEventListener('click', () => {
        page++;
        loadMovieData();
    });

    // Event listener for search form submission
    document.getElementById('searchForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        loadMovieData(title);
      });
    

    // Event listener for clear form button
    document.querySelector('#clearForm').addEventListener('click', () => {
        document.querySelector('#title').value = '';
        page = 1; // Reset to first page
        loadMovieData();
    });

    // Initial data load
    loadMovieData();
});
