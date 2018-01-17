let id = 0;             // counter for unique tile ids
let allFiles = [];      // array of tiles containing file and id properties
let imageCache = {};    // cache image dataURLs by tile ID
let fileView = 'tiles'; // 'tiles' or 'list'

/**
 * Adds a file to the list of tiles
 * @param {File} file the file object to add
 */
function addTile(file) {
    allFiles.push({
        id: id++,
        file: file
    });
    updateFilesList();
}

/**
 * Removes a tile from the list.
 * @param {string} id the unique tile identifier to remove
 */
function removeTile(id) {
    allFiles = allFiles.filter(t => t.id !== id);
    updateFilesList();
}

/**
 * Makes an immutable update of the file list html by mapping the current 
 * tiles array.
 */
function updateFilesList() {
    const container = document.getElementById('file-container');
    container.innerHTML = allFiles
        .map(fileView === 'tiles' ? mapTileHtml : mapListItemHtml)
        .reduce((acc, next) => acc.concat(next), '');

    // Update total size
    document.getElementById('total-size').innerHTML = 
        formatFileSize(allFiles.reduce((acc, next) => acc + next.file.size, 0));
}

/**
 * Maps a file object to an html representation of a tile with details about 
 * the file.
 * @param {object} fileInfo the file object to display
 * @returns {string} the html string for the given file tile
 */
function mapTileHtml(fileInfo) {
    return `<div class="col-3">
                <div class="card m1">
                    <i class="fa fa-trash icon-topright" aria-label="remove file" onclick="removeTile(${fileInfo.id})"></i>
                    <header class="card-header">
                        <p class="bold pl2 pr3 truncate-ellipsis">
                            ${fileInfo.file.name}
                        </p>
                    </header>
                    <div class="card-content flex justify-center items-center height-2">
                        ${mapTileImageHtml(fileInfo)}
                    </div>
                    <footer class="card-footer">
                        <p class="card-footer-item m0 h5 height-1 overflow-hidden">${fileInfo.file.type ? fileInfo.file.type : 'unknown'}</p>
                        <p class="card-footer-item m0 h5 height-1 overflow-hidden">${formatFileSize(fileInfo.file.size)}</a>
                    </footer>
                </div>
            </div>`;
}

/**
 * Maps a file object to an html representation of a list item with details
 * about the file
 * @param {object} fileInfo the file object to display
 */
function mapListItemHtml(fileInfo) {
    return `<div class="col-12">
                <div class="card m1">
                    <i class="fa fa-trash icon-topright" aria-label="remove file" onclick="removeTile(${fileInfo.id})"></i>
                    <div class="card-content flex justify-between">
                        <div class="flex items-center">
                            <div class="height-1 width-1 flex justiy-center items-center">
                                ${mapTileImageHtml(fileInfo)}
                            </div>
                            <div class="media-content">
                                <p class="title is-4">${fileInfo.file.name}</p>
                            </div>
                        </div>
                        <div class="flex flex-column items-end justify-center">
                            <p class="title is-4">${fileInfo.file.type ? fileInfo.file.type : 'unknown'}</p>
                            <p class="subtitle is-4">${formatFileSize(fileInfo.file.size)}</p>
                        </div>
                    </div>
                </div>
            </div>`;
}

/**
 * Maps a tile object to an html string of the image element.
 * Image preview if file is an image type, placeholder icon otherwise.
 * @param {object} tile tile object with id and file properties 
 */
function mapTileImageHtml(tile) {
    if (tile.file.type.startsWith('image/')) {
        readImageFromFile(tile);
        const imgSrc = imageCache[tile.id] ? imageCache[tile.id] : '';
        return `<img id="${tile.id}-preview" src="${imgSrc}" height="50" width="50"></img>`;
    }
    return `<i height="50" class="h1 fa fa-file" aria-hidden="true"></i>`;
}

/**
 * If image is not in the cache, reads it from file sets the tile preview.
 * @param {object} tile tile object with id and file properties
 */
function readImageFromFile(tile) {
    if (imageCache[tile.id]) {
        return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', function() {
        imageCache[tile.id] = reader.result;
        document
            .getElementById(`${tile.id}-preview`)
            .src = reader.result;
    })
    reader.readAsDataURL(tile.file);
}

/**
 * Creates and returns a formatted file size string
 * @param {number} size the total file size
 * @returns {string} the formatted file size string 
 */
function formatFileSize(size) {
    if (size > 1048576) {
        return `${(size/1048576).toFixed(1)} MB`;
    } else if (size > 1024 ) {
        return `${(size/1024).toFixed(1)} KB`;
    }
    return `${size} bytes`;
}

/**
 * Event hanlder for the input type="file" element which adds a tile
 * @param {File[]} files the array of selected files
 */
function onFileSelect(files) {
    addTile(files[0]);
}

/**
 * Event handler for the 'tile view' toggle
 * Sets the view to tile, updates files, and updates toggle color
 */
function viewTiles() {
    if (fileView === 'tiles') return;
    fileView = 'tiles';
    updateFilesList();
    document.getElementById('btn-tile').classList.add('is-info');
    document.getElementById('btn-list').classList.remove('is-info');
}

/**
 * Event handler for the 'list view' toggle
 * Sets the view to list, updates files, and updates toggle color
 */
function viewList() {
    if (fileView === 'list') return;
    fileView = 'list';
    updateFilesList();
    document.getElementById('btn-tile').classList.remove('is-info');
    document.getElementById('btn-list').classList.add('is-info');
}

