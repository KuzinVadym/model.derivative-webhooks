
function cleanTableData(id){
  while (document.getElementById(id).firstChild) {
      document.getElementById(id).removeChild(document.getElementById(id).firstChild);
  }
}
function createWebHooksTable(id) {
  let selectedHook = getAllHooks().filter(item => item.hookId === getSelectedListElement())[0];
  let tbody = document.getElementById('hooktablebody');

  let idtr = document.createElement('div');
  let idth = document.createElement('div');
  let idtd = document.createElement('div');
  idtr.setAttribute('class', 'row rowstyle');
  idth.setAttribute('class', 'col-sm-4 leftcol');
  idtd.setAttribute('class', 'col-sm-8 rightcol');
  idth.appendChild(document.createTextNode('Hook ID'));
  idtd.appendChild(document.createTextNode(`${selectedHook.hookId}`));
  idtr.appendChild(idth);
  idtr.appendChild(idtd);
  let tenanttr = document.createElement('div');
  let tenantth = document.createElement('div');
  let tenanttd = document.createElement('div');
  tenanttr.setAttribute('class', 'row rowstyle');
  tenantth.setAttribute('class', 'col-sm-4 leftcol');
  tenanttd.setAttribute('class', 'col-sm-8 rightcol');
  tenantth.appendChild(document.createTextNode('Workflow ID'));
  tenanttd.appendChild(document.createTextNode(`${selectedHook.tenant}`));
  tenanttr.appendChild(tenantth);
  tenanttr.appendChild(tenanttd);
  let statustr = document.createElement('div');
  let statusth = document.createElement('div');
  let statustd = document.createElement('div');
  statustr.setAttribute('class', 'row rowstyle');
  statusth.setAttribute('class', 'col-sm-4 leftcol');
  statustd.setAttribute('class', 'col-sm-8 rightcol');
  statusth.appendChild(document.createTextNode('Status'));
  statustd.appendChild(document.createTextNode(`${selectedHook.status}`));
  statustr.appendChild(statusth);
  statustr.appendChild(statustd);
  let urltr = document.createElement('div');
  let urlth = document.createElement('div');
  let urltd = document.createElement('div');
  urltr.setAttribute('class', 'row rowstyle');
  urlth.setAttribute('class', 'col-sm-4 leftcol');
  urltd.setAttribute('class', 'col-sm-8 rightcol');
  urlth.appendChild(document.createTextNode('URL'));
  urltd.appendChild(document.createTextNode(`${selectedHook.callbackUrl}`));
  urltr.appendChild(urlth);
  urltr.appendChild(urltd);
  let eventtr = document.createElement('div');
  let eventth = document.createElement('div');
  let eventtd = document.createElement('div');
  eventtr.setAttribute('class', 'row rowstyle');
  eventth.setAttribute('class', 'col-sm-4 leftcol');
  eventtd.setAttribute('class', 'col-sm-8 rightcol');
  eventth.appendChild(document.createTextNode('Event'));
  eventtd.appendChild(document.createTextNode(`${selectedHook.event}`));
  eventtr.appendChild(eventth);
  eventtr.appendChild(eventtd);
  tbody.appendChild(idtr);
  tbody.appendChild(tenanttr);
  tbody.appendChild(statustr);
  tbody.appendChild(urltr);
  tbody.appendChild(eventtr);
}