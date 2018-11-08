
$(document).ready(function () {
  removeCurrentUrn();
  removeSelectedListElement();
  $('form#newwebhookform').hide();
  var auth = isGoogleAuthorized();
  if (!isGoogleAuthorized()) {
  }
  else {
    prepareHooksList();
  }
  $('form#newwebhookform').submit(ajaxTest);
  $('#newWebHook').click(showNewWebHookForm);
  $('#deleteWebHook').click(deleteWebhook);
});

function showNewWebHookForm() {
  $('form#newwebhookform').show();
}

function hideNewWebHookForm() {
  $('form#newwebhookform').hide();
}

function ajaxTest(e) {
  console.log('ajaxTest');
    let newcallbackURL;
    if ($("input#testWebHookId").val() !== '' && $("input#inputWorkFlowType").val() !== '' && $("input#inputWorkFlowId").val() !== '') {
      newcallbackURL = $("input#testWebHookId").val() //for example https://webhook.site/cc7c96d5-28ae-4611-a622-58c308ee5138
    } else {
      $.notify('Set all webhook fields first!', 'warn');
      return;
    }
    let newwebhook = {
      workflow: $("input#inputWorkFlowId").val(),
      type: $("input#inputWorkFlowType").val(),
      callbackURL: newcallbackURL
    }
    console.log(newwebhook);
    jQuery.ajax({
      url: '/webhooks/register',
      contentType: 'application/json',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify({
        'webhook': newwebhook
      }),
      success: function (res) {
        console.log('Submission was successful.');
        if (res.status === 'success') {
          cleanTableData('hooktablebody');
          prepareHooksList(() => {
            $.notify(res.message, 'info');
          });
        } else {
          $.notify(res.message, 'warn');
        }
      },
      error: function (res) {
        console.log('An error occurred.');
      }
    });

    e.preventDefault(); // avoid to execute the actual submit of the form.
}


function createnewhook() {
  console.log('createnewhook');
  let newcallbackURL;
  if ($("input#testWebHookId").val() !== '' && $("input#inputWorkFlowType").val() !== '' && $("input#inputWorkFlowId").val() !== '') {
    newcallbackURL = $("input#testWebHookId").val() //for example https://webhook.site/cc7c96d5-28ae-4611-a622-58c308ee5138
  } else {
    $.notify('Set all webhook fields first!', 'warn');
    return;
  }
  let newwebhook = {
    workflow: $("input#inputWorkFlowId").val(),
    type: $("input#inputWorkFlowType").val(),
    callbackURL: newcallbackURL
  }
  fetch('/webhooks/register', {
    method: 'POST',
    contentType: 'application/json',
    headers: {
         "Content-Type": "application/json"
    },
    body: JSON.stringify({
      'webhook': newwebhook
    })
  }).then(response => response.json())
  .then(res => {
    if (res.status === 'success') {
      cleanTableData('hooktablebody');
      prepareHooksList(() => {
        $.notify(res.message, 'info');
      });
    } else {
      $.notify(res.message, 'warn');
    }

  })
  .catch(err => {
    $.notify(err, 'error');
  });
};

function unselectListElements(){
  if(getSelectedListElement()) {
    document.getElementById(getSelectedListElement()).setAttribute('class', 'list-group-item');
  }
}

function cleanWebHooksList(){
  while (document.getElementById('webhooklist').firstChild) {
      document.getElementById('webhooklist').removeChild(document.getElementById('webhooklist').firstChild);
  }
}

function refreshWebHookData(){
  cleanTableData('hooktablebody');
  createWebHooksTable('hooktablebody');
}

function selectListElementHandler() {
  unselectListElements();
  saveSelectedListElement(event.target.getAttribute('id'));
  event.target.setAttribute('class', 'list-group-item active');
  refreshWebHookData();
}

function prepareHooksList(callback) {
  cleanWebHooksList();
  fetch('/webhooks/getall', {
    method: 'GET',
    contentType: 'application/json',
    headers: {
         "Content-Type": "application/json"
    }
  }).then(response => response.json())
  .then(res => {
    saveAllHooks(res);
    removeSelectedListElement();
    unselectListElements();
    res.forEach((item, index) => {
      let webhooklist = document.getElementById('webhooklist');
      let listElement = document.createElement("LI");
      let url = (item.callbackUrl.length > 35) ? `${item.callbackUrl.substring(0,35)}...` : item.callbackUrl;
      listElement.appendChild(document.createTextNode(url));
      listElement.setAttribute('class', 'list-group-item');
      listElement.setAttribute('id', `${item.hookId}`);
      listElement.addEventListener("click", selectListElementHandler);
      webhooklist.appendChild(listElement);
    })
    if (callback) {
      callback();
    }
  })
  .catch(err => {
    $.notify(err, 'error');
  });
}

function deleteWebhook() {
  let data = getAllHooks().filter(item => item.hookId === getSelectedListElement())[0];
  fetch('/webhooks/delete/', {
    method: 'POST',
    contentType: 'application/json',
    headers: {
         "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(response => response.json())
  .then(res => {
    if (res.status === 'success') {
      cleanTableData('hooktablebody');
      prepareHooksList(()=> {
        $.notify('Webhook successfully deleted.', 'info');
      });
    } else {
      $.notify('Sorry, something went wrong during deleting webhook.', 'warn');
    }
  })
  .catch(err => {
    $.notify(err, 'error');
  });
}