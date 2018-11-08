
function saveCurrentUrn(urn) {
  if (urn) {
    sessionStorage.setItem('current_urn', urn);
  }
}

function getCurrentUrn() {
    return sessionStorage.getItem('current_urn');
}

function removeCurrentUrn() {
    return sessionStorage.removeItem('current_urn');
}


function saveSelectedListElement(id) {
  sessionStorage.setItem('selectedElement', id);
}

function getSelectedListElement() {
  return sessionStorage.getItem('selectedElement');
}

function removeSelectedListElement() {
  return sessionStorage.removeItem('selectedElement');
}

function saveAllHooks(hooks) {
  sessionStorage.setItem('allHooks', JSON.stringify(hooks));
}

function getAllHooks() {
  return JSON.parse(sessionStorage.getItem('allHooks'));
}

