/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by ForgeSDK Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

$(document).ready(function () {
  var auth = isGoogleAuthorized();
  if (!isGoogleAuthorized()) {
    $('#refreshGoogleDriveTree').hide();
    $('#getMetaData').hide();
    $('#loginGoogle').click(googleSignIn);
  }
  else {
    $('#loginGoogle').hide();
    $('#refreshGoogleDriveTree').show();
    $('#getMetaData').show();
    $('#refreshGoogleDriveTree').click(function(){
      cleanMetaData();
      $('#myGoogleDriveFiles').jstree(true).refresh();
    });
    $('#getMetaData').click(getMetaData);
    prepareGoogleTree();
  }
});

function googleSignIn() {
  jQuery.ajax({
    url: '/google/authenticate',
    success: function (rootUrl) {
      location.href = rootUrl;
    }
  });
}

function cleanMetaData() {
  if( document.getElementById("metaData").hasChildNodes() ) {
    while (document.getElementById("metaData").firstChild) {
      document.getElementById("metaData").removeChild(document.getElementById("metaData").firstChild);
    }
  }
}

function getMetaData() {
  let urn = getCurrentUrn();
  if(urn !== null) {
    jQuery.ajax({
      url: '/integration/getMetaData',
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify({
        'urn': urn
      }),
      success: function (res) {
        if (res.extractCompleted) {
          res.metaData.data.metadata.forEach(item => {
            let li = document.createElement("LI");
            for(let key in item) {
              let newDiv = document.createElement("div");
              newDiv.appendChild(document.createTextNode(`${key}: ${item[key]} `));
              li.appendChild(newDiv);
            }
            document.getElementById("metaData").appendChild(li);
          })
        } else {
          $.notify("Error occurred during extraction", 'error');
        }
      },
      error: function (res) {
        res = JSON.parse(res.responseText);
        $.notify(res.error, 'error');
      }
    });
  } else {
    $.notify('Sorry, but you need select and translate object first', 'warn');
  }
}

function isGoogleAuthorized() {
  var ret = 'false';
  jQuery.ajax({
    url: '/google/isAuthorized',
    success: function (res) {
      ret = res;
    },
    async: false // this request must be synchronous for the ForgeSDK Viewer
  });
  return (ret === 'true');
}

function prepareGoogleTree() {
  removeCurrentUrn();
  $('#myGoogleDriveFiles').jstree({
    'core': {
      'themes': {"icons": true},
      'data': {
        "url": '/google/getTreeNode',
        "dataType": "json",
        'multiple': false,
        "data": function (node) {
          return {"id": node.id};
        }
      }
    },
    "plugins": ["types", "state", "sort", "contextmenu"],
    contextmenu: {items: googleCustomMenu}
  }).bind("activate_node.jstree", function (evt, data) {
    if (data != null && data.node != null) {
      cleanMetaData();
      translateFile(data.node);
    }
  });
}

function translateFile(googleNode) {
  var extension = (re.exec(googleNode.text)[1]);
  if (!extension){
    $.notify('Sorry, we cannot view files without extension', 'warn');
    return;
  }
  let workflow;
  let hook = getSelectedListElement();
  if (!hook){
    $.notify('Please set webhook first', 'warn');
    return;
  } else {
    workflow = getAllHooks().filter(item => item.hookId === getSelectedListElement())[0];
  }

  isFileSupported(googleNode.text, function (supported) {
    if (!supported) {
      $.notify('File "' + googleNode.text + '" cannot be viewed, format not supported.', 'warn');
      return;
    }

    $.notify('Preparing to view "' + googleNode.text + '", please wait...', 'info');

    fetch('/integration/sendToTranslation', {
      method: 'POST',
      contentType: 'application/json',
      headers: {
           "Content-Type": "application/json"
      },
      body: JSON.stringify({
        'googlefile': googleNode.id,
        'workflow': workflow.tenant
      })
    }).then(response => response.json())
    .then(res => {
      $.notify(res.status + (res.readyToShow ? ' Getting Meta Data.' : ''), 'info');
      if (res.readyToShow) {
        saveCurrentUrn(res.urn);
      } else {
        wait(res.urn); // not ready to show... wait 5 seconds
      }
    })
    .catch(err => {
      $.notify(err, 'error');
    });
  });
}

function wait(urn) {
  setTimeout(function () {
    fetch('/integration/isReadyToShow', {
      method: 'POST',
      contentType: 'application/json',
      headers: {
           "Content-Type": "application/json"
      },
      body: JSON.stringify({
        'urn': urn
      })
    })
    .then(response => response.json())
    .then(res => {
      if (res.readyToShow) {
        $.notify('Ready! Getting Meta Data.', 'info');
        saveCurrentUrn(res.urn);
      }
      else {
        $.notify(res.status, 'warn');
        wait(res.urn);
      }
    })
    .catch(err => {
      $.notify(err, 'error');
    });
  }, 5000);
}

function googleCustomMenu(googleNode) {
  var items;

  if (googleNode.type == 'file') {
    items = {
      renameItem: {
        label: "Download as OBJ",
        icon: "/img/autodesk-forge.png",
        action: function () {
          isFileSupported(googleNode.text, function (supported) {
            if (supported) {
              $.notify('Sorry, not implemented on this sample (WIP)', 'error');
            }
            else
              $.notify('Cannot extract OBJ, format not supported.', 'error');
          });
        }
      }
    };
  }
  return items;
}

var re = /(?:\.([^.]+))?$/; // regex to extract file extension

function isFileSupported(fileName, callback) {
  var extension = (re.exec(fileName)[1]).toLowerCase();
  jQuery.ajax({
    url: '/md/viewerFormats',
    contentType: 'application/json',
    type: 'GET',
    dataType: 'json',
    success: function (supportedFormats) {
      // for a zip we need to define the rootFilename, need extra work (WIP)
      // let's remove it from the supported formats, for now
      supportedFormats.splice(supportedFormats.indexOf('zip'),1);
      var supported = ( jQuery.inArray(extension, supportedFormats) >= 0);
      callback(supported);
    },
    error: function (res) {
      res = JSON.parse(res.responseText);
      $.notify(res.error, 'error');
    }
  });
}
