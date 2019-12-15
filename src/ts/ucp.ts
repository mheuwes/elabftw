/**
 * @author Nicolas CARPi <nicolas.carpi@curie.fr>
 * @copyright 2012 Nicolas CARPi
 * @see https://www.elabftw.net Official website
 * @license AGPL-3.0
 * @package elabftw
 */
declare var tinymce: any;
import { saveAs } from 'file-saver/dist/FileSaver.js';
import { notif } from './misc';

$(document).ready(function() {
  $.ajaxSetup({
    headers: {
      'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
    }
  });
  let Templates = {
    controller: 'app/controllers/EntityAjaxController.php',
    saveToFile: function(id, name) {
      // we have the name of the template used for filename
      // and we have the id of the editor to get the content from
      // we don't use activeEditor because it requires a click inside the editing area
      const content = tinymce.get(id).getContent();
      const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
      saveAs(blob, name + '.elabftw.tpl');
    },
    destroy: function(id) {
      if (confirm('Delete this ?')) {
        $.post(this.controller, {
          destroy: true,
          id: id,
          type: 'experiments_templates'
        }).done(function(json) {
          notif(json);
          if (json.res) {
            window.location.replace('ucp.php?tab=3');
          }
        });
      }
    }
  };

  $(document).on('click', '.saveToFile', function() {
    Templates.saveToFile($(this).data('id'), $(this).data('name'));
  });
  $(document).on('click', '.destroy-template', function() {
    Templates.destroy($(this).data('id'));
  });

  $(document).on('click', '#import-from-file', function() {
    $('#import_tpl').toggle();
  });

  // input to upload an elabftw.tpl file
  $('#import_tpl').hide().on('change', function() {
    const title = (<any>document.getElementById('import_tpl')).value.replace('.elabftw.tpl', '').replace('C:\\fakepath\\', '');
    if (!window.FileReader) {
      alert('Please use a modern web browser. Import aborted.');
      return false;
    }
    let reader = new FileReader();
    reader.onload = function(e) {
      // switch for markdown mode
      if ($('#new_tpl_txt').hasClass('mceditable')) {
        tinymce.get('new_tpl_txt').setContent(e.target.result);
      } else {
        $('#new_tpl_txt').text(<any>e.target.result);
      }
      $('#new_tpl_name').val(title);
      $('#import_tpl').hide();
    };

    reader.readAsText((<any>this).files[0]);
  });

  // TinyMCE
  tinymce.init({
    mode : 'specific_textareas',
    editor_selector : 'mceditable',
    skin_url: 'app/css/tinymce',
    plugins: 'table searchreplace code fullscreen insertdatetime paste charmap lists advlist save image imagetools link pagebreak mention codesample hr',
    pagebreak_separator: '<pagebreak>',
    toolbar1: 'undo redo | styleselect bold italic underline | alignleft aligncenter alignright alignjustify | superscript subscript | bullist numlist outdent indent | forecolor backcolor | charmap | codesample | link',
    removed_menuitems: 'newdocument, image',
    mentions: {
      // use # for autocompletion
      delimiter: '#',
      // get the source from json with get request
      source: function (query, process) {
        let url = 'app/controllers/EntityAjaxController.php?mention=1&term=' + query;
        $.getJSON(url, function(data) {
          process(data);
        });
      }
    },
    language : $('#language').data('lang')
  });

  // DESTROY API KEY
  $(document).on('click', '.keyDestroy', function() {
    $.post('app/controllers/AjaxController.php', {
      destroyApiKey: true,
      id: $(this).data('id')
    }).done(function(json) {
      notif(json);
      $('#apiTable').load('ucp.php #apiTable');
    });
  });
});