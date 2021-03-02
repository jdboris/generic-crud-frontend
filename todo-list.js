const URL = "http://localhost:3000/";

class Item {
  constructor(id = null, task = null) {
    this.id = id;
    this.task = task;
  }

  static async read() {
    return fetch(URL + "backend.php", {
      method: "GET",
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        return data.map((item) => {
          return new Item(item.id, item.task);
        });
      });
  }

  async save() {
    if (this.id !== null) {
      return fetch(URL + "backend.php", {
        method: "PUT",
        body: JSON.stringify(this),
      });
    } else {
      return fetch(URL + "backend.php", {
        method: "POST",
        body: JSON.stringify(this),
      });
    }
  }

  async delete() {
    return fetch(URL + "backend.php", {
      method: "DELETE",
      body: JSON.stringify({ id: this.id }),
    });
  }
}

function newTodoList() {
  let todoList = E(`<div></div>`);
  let items = [];

  readItems();

  function readItems() {
    Item.read().then((data) => {
      items = data;
      render();
    });
  }

  function render() {
    todoList.innerHTML = "";

    for (let item of items) {
      todoList.append(ItemForm("read", item));
    }

    let createButton = E(`<button>Add Item</button`);
    createButton.onclick = () => {
      let item = new Item();
      let form = ItemForm("create", item);

      todoList.append(form);
      createButton.classList.add("hidden");
    };
    todoList.append(createButton);
  }

  function ItemForm(state, item) {
    let form = E(`<form></form>`);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    render(state);

    function render(state) {
      form.innerHTML = "";
      let disabledInRead = state == "read" ? "disabled" : "";

      form.append(
        newInput(`<input ${disabledInRead} type="text" name="task" />`, item)
      );

      if (state == "create") {
        let submitButton = E(`<button type="submit">Add</button`);
        form.append(submitButton);

        form.onsubmit = () => {
          item.save().then(() => {
            readItems();
          });
        };
      } else if (state == "update") {
        let cancelButton = E(`<button>X</button`);
        cancelButton.onclick = () => {
          render("read");
        };
        form.prepend(cancelButton);

        let saveButton = E(`<button>💾</button`);
        saveButton.onclick = () => {
          item.save().then(() => {
            readItems();
          });
        };
        form.append(saveButton);

        let deleteButton = E(`<button>🗑️</button`);
        deleteButton.onclick = () => {
          item.delete().then(() => {
            readItems();
          });
        };
        form.append(deleteButton);
      } else if (state == "read") {
        let editButton = E(`<button>✎</button`);
        editButton.onclick = () => {
          render("update");
        };

        form.prepend(editButton);
      }
    }

    return form;
  }

  return todoList;
}

function E(html) {
  let template = document.createElement("template");
  html = html.trim();
  template.innerHTML = html;
  return template.content.firstChild;
}

function newInput(html, boundObject) {
  let input = E(html);

  input.value = boundObject[input.name];
  input.oninput = () => {
    boundObject[input.name] = input.value;
  };

  return input;
}

function insertHere(element) {
  document.currentScript.parentNode.insertBefore(
    element,
    document.currentScript
  );
}
