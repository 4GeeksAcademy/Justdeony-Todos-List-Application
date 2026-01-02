import React, { useState, useEffect } from "react";

const Home = () => {
  const [username, setUsername] = useState("user");
  const API_URL = `https://playground.4geeks.com/todo/users/${username}`;
  const USER_URL = `https://playground.4geeks.com/todo/users/${username}`;
  const TODOS_URL = `https://playground.4geeks.com/todo/todos/${username}`;

  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Load todos on start, create user if necessary
  useEffect(() => {
    fetch(API_URL)
      .then((resp) => {
        if (resp.ok) return resp.json();

        // user doesn't exist → create it
        return fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([]),
        }).then(() => fetch(API_URL).then((resp) => resp.json()));
      })
      .then((data) => {
        setTodos(data.todos || []);
      })
      .catch((error) => console.log(error));
  }, []);

  // ADD task API
  const addTodo = () => {
    if (!inputValue.trim()) return;

    const updatedTodos = [...todos, { label: inputValue, done: false }];

    fetch(API_URL, {
      method: "PUT",
      body: JSON.stringify(updatedTodos),
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => {
        console.log(resp.ok);
        return fetch(API_URL);
      })
      .then((resp) => resp.json())
      .then((data) => {
        setTodos(data.todos || []);
        setInputValue("");
      })
      .catch((error) => console.log(error));
  };

  // DELETE task API
  const deleteTodo = (index) => {
    const updated = todos.filter((_, i) => i !== index);

    fetch(API_URL, {
      method: "PUT",
      body: JSON.stringify(updated),
      headers: { "Content-Type": "application/json" },
    })
      .then((resp) => fetch(API_URL))
      .then((resp) => resp.json())
      .then((data) => setTodos(data.todos || []))
      .catch((error) => console.log(error));
  };

  // CLEAR ALL tasks API
  const clearAllTodos = () => {
    fetch(API_URL, {
      method: "DELETE",
    })
      .then((resp) => {
        if (!resp.ok) throw new Error("Failed to delete user");
        return fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([]),
        });
      })
      .then((resp) => {
        if (!resp.ok) throw new Error("Failed to recreate user");
        setTodos([]);
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="container">
      <h2>My Todos List</h2>
      <li>
        <button
          style={{
            display: "flex",
            justifyContent: "flex-end",
            listStyle: "none",
            marginTop: "20px",
            marginRight: "20px",
            padding: "5px 20px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
            display:
              "inline-block" /* Keeps the background wrapped tightly around the text */,
          }}
          onClick={clearAllTodos}
        >
          <h1>Clear All Tasks</h1>
        </button>
      </li>
      <div>
        <h5>{todos.length} ideas created!</h5>
      </div>
      <ul>
        <li>
          <input
            type="text"
            onChange={(e) => setInputValue(e.target.value)}
            value={inputValue}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const task = {
                  label: inputValue,
                  done: false,
                };

                fetch(TODOS_URL, {
                  method: "POST",
                  body: JSON.stringify(task),
                  headers: { "Content-Type": "application/json" },
                })
                  .then(() => fetch(USER_URL)) // GET updated list
                  .then((resp) => resp.json())
                  .then((data) => {
                    setTodos(data.todos);
                    setInputValue("");
                  })
                  .catch((err) => console.log(err));
              }
            }}
            placeholder="What You're Thinking?"
          />
        </li>

        {todos.map((item, index) => (
          <li key={index}>
            {item.label}

            <button
              onClick={() => {
                fetch(`https://playground.4geeks.com/todo/todos/${item.id}`, {
                  method: "DELETE",
                })
                  .then(() => fetch(USER_URL)) // GET updated list
                  .then((resp) => resp.json())
                  .then((data) => setTodos(data.todos))
                  .catch((err) => console.log(err));
              }}
              style={{ float: "right" }}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
