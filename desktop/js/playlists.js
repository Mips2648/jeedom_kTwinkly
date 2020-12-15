/* This file is part of Jeedom.
*
* Jeedom is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* Jeedom is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
*/

$("#playlist").sortable({
    axis: "y",
    cursor: "move",
    items: ".plitem",
    placeholder: "ui-state-highlight",
    tolerance: "intersect",
    forcePlaceholderSize: true,
    update: function( event, ui ) { playlistNotSaved = 1; }
});

$('#md_modal').on('dialogclose', function(event) {
    $('#md_modal').off('dialogclose');
    //console.log('equipement id = ' + $('.eqLogicAttr[data-l1key=id]').value());
});

$('.deletePlaylist').off('click').on('click', function() {
    bootbox.confirm('{{Etes-vous sûr de vouloir supprimer la playlist courante}} ?', function (result) {
        if (result) {
            $('#playlist #action').val('deletePlaylist');
            $.ajax({
                type: "POST",
                url: 'plugins/kTwinkly/core/ajax/kTwinkly.ajax.php',
                data: $("#playlist").serialize(),
                datatype: 'json',
                error: function(request, status, error) { },
                success: function (data) {
                    if (data.state != 'ok') { 
                        $('#div_alert_playlists').showAlert({message: data.result, level: 'danger'});
                        return;
                    } else {
                        $('#div_alert_playlists').showAlert({message: data.result, level: 'info'});
                    }
                }
            });
        }
    });
});

$('.clearMemory').off('click').on('click', function() {
    bootbox.confirm('{{Etes-vous sûr de vouloir effacer les animations en mémoire}} ?', function (result) {
        if (result) {
            $('#playlist #action').val('clearMemory');
            $.ajax({
                type: "POST",
                url: 'plugins/kTwinkly/core/ajax/kTwinkly.ajax.php',
                data: $("#playlist").serialize(),
                datatype: 'json',
                error: function(request, status, error) { },
                success: function (data) {
                    if (data.state != 'ok') { 
                        $('#div_alert_playlists').showAlert({message: data.result, level: 'danger'});
                        return;
                    } else {
                        $('#div_alert_playlists').showAlert({message: data.result, level: 'info'});
                    }
                }
            });
        }
    });
});

$('.savePlaylist').off('click').on('click', function() {
    var newPlaylist = [];
    $('#playlist tr.plitem').each(function(i,v) {
        var duration = $(v).find('input.playlistDuration').val();
        var movie = $(v).find('select.playlistMovie option:selected').val();
        newPlaylist.push({"index":i, "filename": movie, "duration": duration});
    });

    $.ajax({
        type: "POST",
        url: 'plugins/kTwinkly/core/ajax/kTwinkly.ajax.php',
        data: {
            'action': 'createPlaylist',
            'id': $('.eqLogicAttr[data-l1key=id]').value(),
            'playlist': newPlaylist
        },
        datatype: 'json',
        error: function(request, status, error) { },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert_playlists').showAlert({message: data.result, level: 'danger'});
                return;
            } else {
                $('#div_alert_playlists').showAlert({message: data.result, level: 'info'});
                playlistNotSaved=0;
            }
        }
    });
});

$('.addToPlaylist').off('click').on('click', function() {
    var tr = '<tr class="plitem">';
    tr += '  <td>';
    tr += '      <select class="form-control playlistAttr playlistMovie" name="plItems[]">';
    $('#availableMoviesList option').each(function() {
        tr += '<option value="' + $(this).val() + '">' + $(this).text() + '</option>';
    });
    tr += '      </select>';
    tr += '  </td>';
    tr += '  <td>';
    tr += '      <input class="playlistAttr form-control input-sm playlistDuration" style="width: 10%" maxlength="10" name="duration[]" value="30"/>';
    tr += '  </td>';
    tr += '  <td>';
    tr += '     <i class="fas fa-minus-circle pull-right cursor removeFromPlaylist" data-plitem="1234"></i>';
    tr += '  </td>';
    tr += '</tr>';

    $('#playlist tbody').append(tr);
    playlistNotSaved=1;
});

$.ajax({
    type: "POST",
    url: 'plugins/kTwinkly/core/ajax/kTwinkly.ajax.php',
    data: {
        'action': 'getDetailedPlaylist',
        'id': $('.eqLogicAttr[data-l1key=id]').value()
    },
    datatype: 'json',
    error: function(request, status, error) { },
    success: function (data) {
        if (data.state != 'ok') {
            $('#div_alert_playlists').showAlert({message: data.result, level: 'danger'});
            return;
        } else {
            var allmovies = data.result.movies;
            var playlist = data.result.playlist;
            allmovies.forEach(function(e) {
                $('#availableMoviesList').append($('<option>', { 
                    //val: e.unique_id,
                    val: e.filename,
                    text : e.title,
                    "data-movieid" : e.unique_id
                }));
            });
            playlist.forEach(function(e) {
                var tr = '<tr class="plitem">';
                tr += '  <td>';
                tr += '      <select class="form-control playlistAttr playlistMovie" name="plItems[]">';
                $('#availableMoviesList option').each(function() {
                    //tr += '<option value="' + $(this).val() + '"' + ($(this).val() === e.unique_id?" selected":"") + '>' + $(this).text() + '</option>';
                    tr += '<option value="' + $(this).val() + '"' + ($(this).attr('data-movieid') === e.unique_id?" selected":"") + '>' + $(this).text() + '</option>';
                });
                tr += '      </select>';
                tr += '  </td>';
                tr += '  <td>';
                tr += '      <input class="playlistAttr form-control input-sm playlistDuration" style="width: 10%" maxlength="10" name="duration[]" value="' + e.duration + '"/>';
                tr += '  </td>';
                tr += '  <td>';
                tr += '     <i class="fas fa-minus-circle pull-right cursor removeFromPlaylist"></i>';
                tr += '  </td>';
                tr += '</tr>';

                $('#playlist tbody').append(tr);
            });
            playlistNotSaved=0;
        }
    }
});

$("#playlist").on("click", ".removeFromPlaylist", function(){
    $(this).closest('tr').remove();
    playlistNotSaved = 1;
});

$("#playlist").on("change", ".playlistAttr", function() {
    playlistNotSaved = 1;
});
