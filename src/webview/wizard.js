const vscode = acquireVsCodeApi();

let currentItem = null;
let formData = {};

fetchItems();

function fetchItems() {
  vscode.postMessage({ command: 'getItems' });
}

window.addEventListener('message', event => {
  if (event.data.command === 'items') {
    renderSelect(event.data.items);
  }
});

function renderSelect(items) {
  const select = document.getElementById('itemSelect');
  select.innerHTML = '<option value="">-- Select --</option>';

  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.label;
    select.appendChild(opt);
  });

  select.onchange = () => {
    const item = items.find(i => i.id === select.value);
    renderForm(item);
  };
}

function renderForm(item) {
  currentItem = item;
  formData = {};

  const formContainer = document.getElementById('formContainer');
  const attributesContainer = document.getElementById('attributesContainer');
  const attributesList = document.getElementById('attributesList');
  const generateBtn = document.getElementById('generateBtn');
  const addAttributeBtn = document.getElementById('addAttributeBtn');

  formContainer.innerHTML = '';
  attributesList.innerHTML = '';
  attributesContainer.style.display = 'none';
  generateBtn.disabled = true;

  if (!item) return;

  item.fields.forEach(field => {
    if (field.type === 'attributes') {
      attributesContainer.style.display = 'block';
      formData[field.id] = [];

      addAttributeBtn.onclick = () => {
        if (!field.fields || !Array.isArray(field.fields)) {
          console.error('Attributes field has no schema:', field);
          return;
        }

        handleAddAttribute(field);
      };

      return;
    }

    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '6px';
    wrapper.style.width = '100%';

    const label = document.createElement('label');
    label.textContent = field.required
      ? field.label
      : `${field.label} (optional)`;

    let input;

    if (field.type === 'text' && Array.isArray(field.values)) {
      input = document.createElement('select');

      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = '-- Select --';
      input.appendChild(defaultOption);

      field.values.forEach(v => {
      const option = document.createElement('option');

      if (typeof v === 'string') {
        option.value = v;
        option.textContent = v;
      } else {
        option.value = v.value;
        option.textContent = v.label;
      }

      input.appendChild(option);
    });
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = field.placeholder || '';
    }

    if (field.required) {
      input.required = true;
    }

    input.style.width = '100%';

    const updateValue = e => {
      formData[field.id] = e.target.value;

      if (field.required) {
        input.classList.toggle(
          'invalid',
          !e.target.value || !e.target.value.trim()
        );
      }

      generateBtn.disabled = !isFormValid(item, formData);
    };


    input.addEventListener('input', updateValue);
    input.addEventListener('change', updateValue);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    formContainer.appendChild(wrapper);
  });
}

function handleAddAttribute(field) {
  const attributesList = document.getElementById('attributesList');
  const generateBtn = document.getElementById('generateBtn');

  const attributeData = {};
  const row = document.createElement('div');
  row.className = 'attribute-row';

  field.fields.forEach(attrField => {
    const wrapper = document.createElement('div');
    wrapper.className = 'attribute-field';

    const label = document.createElement('label');
    label.textContent = attrField.required
      ? attrField.label
      : `${attrField.label} (optional)`;
    label.style.marginRight = "8px";

    let input;

    if (Array.isArray(attrField.values)) {
      input = document.createElement('select');

      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '-- Select --';
      input.appendChild(empty);

      attrField.values.forEach(v => {
        const option = document.createElement('option');

        if (typeof v === 'string') {
          option.value = v;
          option.textContent = v;
        } else {
          option.value = v.value;
          option.textContent = v.label;
        }

        input.appendChild(option);
      });
    }
    else {
      input = document.createElement('input');
      input.type = 'text';
      input.placeholder = attrField.placeholder || '';
    }

    const updateValue = e => {
      attributeData[attrField.id] = e.target.value;
      generateBtn.disabled = !isFormValid(currentItem, formData);
    };

    input.addEventListener('input', updateValue);
    input.addEventListener('change', updateValue);

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    row.appendChild(wrapper);
  });

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.textContent = '✕';
  removeBtn.className = 'remove-attribute';

  removeBtn.onclick = () => {
    attributesList.removeChild(row);
    formData[field.id] = formData[field.id].filter(a => a !== attributeData);
    generateBtn.disabled = !isFormValid(currentItem, formData);
  };

  row.appendChild(removeBtn);
  attributesList.appendChild(row);

  formData[field.id].push(attributeData);

  generateBtn.disabled = !isFormValid(currentItem, formData);
}

function addAttributeRow(list) {
  const row = document.createElement('div');
  row.className = 'attribute-row';

  const nameWrapper = document.createElement('div');
  nameWrapper.style.display = 'flex';
  nameWrapper.style.flexDirection = 'column';
  nameWrapper.style.gap = '4px';
  nameWrapper.style.flex = '1';
  
  const nameLabel = document.createElement('label');
  nameLabel.textContent = 'Name';

  const nameInput = document.createElement('input');
  nameInput.placeholder = 'name';

  nameWrapper.appendChild(nameLabel);
  nameWrapper.appendChild(nameInput);

  const typeWrapper = document.createElement('div');
  typeWrapper.style.display = 'flex';
  typeWrapper.style.flexDirection = 'column';
  typeWrapper.style.gap = '4px';
  typeWrapper.style.flex = '1';

  const typeLabel = document.createElement('label');
  typeLabel.textContent = 'Type';

  const typeInput = document.createElement('input');
  typeInput.placeholder = 'type';

  typeWrapper.appendChild(typeLabel);
  typeWrapper.appendChild(typeInput);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = '×';
  remove.className = 'remove-attribute';

  remove.onclick = () => row.remove();

  row.appendChild(nameWrapper);
  row.appendChild(typeWrapper);
  row.appendChild(remove);

  list.appendChild(row);
}

function collectAttributes() {
  const rows = document.querySelectorAll('#attributesList > div');

  return Array.from(rows).map(row => {
    const inputs = row.querySelectorAll('input');
    return {
      name: inputs[0].value,
      type: inputs[1].value
    };
  });
}

function isFormValid(item, data) {
  return item.fields.every(field => {
    if (field.type !== 'attributes') {
      if (!field.required) return true;
      const value = data[field.id];
      return value && value.trim();
    }

    const attributes = data[field.id];
    if (!attributes || attributes.length === 0) return true;

    return attributes.every(attr =>
      field.fields.every(attrField => {
        if (!attrField.required) return true;
        const value = attr[attrField.id];
        return value && value.trim();
      })
    );
  });
}

document.getElementById('addAttributeBtn').onclick = () => {
  const list = document.getElementById('attributesList');
  addAttributeRow(list);
  document.getElementById('generateBtn').disabled = false;
};

document.getElementById('generateBtn').onclick = () => {
  if (!currentItem) return;

  vscode.postMessage({
    command: 'generate',
    type: currentItem.id,
    data: formData
  });
};

