$(document).ready(function() {
    hideExceptFor('main');
    loadDvds();
});

function hideExceptFor(name) {
    $('#errorMessage').empty();
    hideables = ['main', 'edit', 'add', 'disp'];
    $.each(hideables, function(index, value) {
        if (value !== name) {
            $('.' + value).hide();
        } else {
            $('.' + value).show();
        }
    });
}

function loadDvds() {
    $.ajax({
        type: 'GET',
        url: 'https://tsg-dvds.herokuapp.com/dvds',
        success: function (dvdArray) {
            var dvdRows = $('#contentRows');
            dvdRows.empty();
            $.each(dvdArray, function(index, dvd) {
                dvdRows.append(getDvdEntry(dvd));
            });
        },
        error: function() {
            addError('Could not communicate with database.  Try again later.');
        }
    });
}

function loadFilteredDvds() {
    if (isValidInput($('#searchForm').find('select, input'), false)) {
        $.ajax({
            type: 'GET',
            url: 'https://tsg-dvds.herokuapp.com/dvds/' + $('#searchType').val() + '/' + $('#searchString').val(),
            success: function (dvdArray) {
                var dvdRows = $('#contentRows');
                dvdRows.empty();
                $.each(dvdArray, function(index, dvd) {
                    dvdRows.append(getDvdEntry(dvd));
                });
            },
            error: function() {
                addError('Could not communicate with database.  Try again later.');
            }
        });
    } else {
        addError('Both "Search Category" and "Search Term" are required');
    }
}

function getDvdEntry(dvd) {
    var title = dvd.title;
    var releaseDate = dvd.releaseYear;
    var director = dvd.director;
    var rating = dvd.rating;

    var entry = '<tr>';
    entry += '<td>' + title + '</td>';
    entry += '<td>' + releaseDate + '</td>';
    entry += '<td>' + director + '</td>';
    entry += '<td>' + rating + '</td>';
    entry += '<td><div class="d-flex justify-content-center"><button class="btn btn-primary mx-1" onclick="showEdit(' + dvd.id + ')">Edit</button>';
    entry += '<button class="btn btn-danger mx-1" onclick="deleteDvd(' + dvd.id + ')">Delete</button></div></td>';
    entry += '</tr>';

    return entry;
}

function showDvdById(id) {
    $.ajax({
        type: 'GET',
        url: 'https://tsg-dvds.herokuapp.com/dvd/' + id,
        success: function (dvd) {
            hideExceptFor('disp');
            $('#dispTitleHeader').text(dvd.title);
            $('#dispReleaseYear').text(dvd.releaseYear);
            $('#dispDirector').text(dvd.director);
            $('#dispRating').text(dvd.rating);
            $('#dispNotes').text(dvd.notes);
        },
        error: function() {
            addError('Could not communicate with database.  Try again later.');
        }
    });
}

function showEdit(id) {
    $.ajax({
        type: 'GET',
        url: 'https://tsg-dvds.herokuapp.com/dvd/' + id,
        success: function (dvd) {
            hideExceptFor('edit');
            $('#editTitleHeader').text('Edit Dvd: ' + dvd.title);
            $('#editTitle').val(dvd.title);
            $('#editReleaseYear').val(dvd.releaseYear);
            $('#editDirector').val(dvd.director);
            $('#editRating').val(dvd.rating);
            $('#editNotes').val(dvd.notes);
            $('#editId').val(dvd.id);
        },
        error: function() {
            addError('Could not communicate with database.  Try again later.');
        }
    });
}

function editDvd() {
    if (isValidInput($('#editForm').find('input'))) {
        $.ajax({
            type: 'PUT',
            url: 'https://tsg-dvds.herokuapp.com/dvd/' + $('#editId').val(),
            contentType: 'application/json',
            data: JSON.stringify({
                id: $('#editId').val(),
                title: $('#editTitle').val(),
                releaseYear: $('#editReleaseYear').val(),
                director: $('#editDirector').val(),
                rating: $('#editRating').val(),
                notes: $('#editNotes').val()
            }),

            success: function() {
                onSuccessfulCrud();
            },

            error: function(xhr, status, error) {
                addError('Error calling web service.  Please try again later.');
            }
        });
    }
}

function addDvd() {
    if (isValidInput($('#addForm').find('input'))) {
        $.ajax({
            type: 'POST',
            url: 'https://tsg-dvds.herokuapp.com/dvd/',
            contentType: 'application/json',
            data: JSON.stringify({
                title: $('#addTitle').val(),
                releaseYear: $('#addReleaseYear').val(),
                director: $('#addDirector').val(),
                rating: $('#addRating').val(),
                notes: $('#addNotes').val()
            }),

            success: function() {
                onSuccessfulCrud();
            },

            error: function() {
                addError('Error communicating with the database; Dvd was not added');
            }
        });
    }
}

function deleteDvd(id) {
    if (window.confirm("Are you sure you want to delete this DvD?")) {
        $.ajax({
            type: 'DELETE',
            url: 'https://tsg-dvds.herokuapp.com/dvd/' + id,

            success: function() {
                onSuccessfulCrud();
            },

            error: function() {
                addError('Error communicating with the database; Dvd was not deleted');
            }
        });
    }
}

function isValidInput(input, addErrorMsg=true) {
    var isValid = true;
    var errorMsgs = {
        'ReleaseYear': 'Please enter a 4-digit year',
        'Title': 'Please enter a movie title'
    };

    $('#errorMessage').empty();

    input.each(function() {
        if (!this.validity.valid) {
            if (addErrorMsg) {
                for (var err in errorMsgs) {
                    if (this.id.endsWith(err)) {
                        addError(errorMsgs[err]);
                        break;
                    }
                }
            }

            isValid = false;
        }
    });

    return isValid;
}

function onSuccessfulCrud() {
    $('#errorMessage').empty();
    hideExceptFor('main');
    loadDvds();
}

function addError(msg) {
    $('#errorMessage')
        .append($('<li>')
        .attr({class: 'list-group-item list-group-item-danger mb-1'})
        .text(msg));
}
