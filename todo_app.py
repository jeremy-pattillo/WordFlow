import streamlit as st
import json
import os
from datetime import datetime

# Suppress pandas/pyarrow warnings
import warnings
warnings.filterwarnings('ignore', category=UserWarning)

def load_todos():
    """Load todos from JSON file"""
    if os.path.exists('todos.json'):
        try:
            with open('todos.json', 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def save_todos(todos):
    """Save todos to JSON file"""
    with open('todos.json', 'w') as f:
        json.dump(todos, f, indent=2)

def add_todo(text):
    """Add a new todo item"""
    todos = load_todos()
    new_todo = {
        'id': len(todos) + 1,
        'text': text,
        'completed': False,
        'created_at': datetime.now().isoformat()
    }
    todos.append(new_todo)
    save_todos(todos)

def toggle_todo(todo_id):
    """Toggle completion status of a todo"""
    todos = load_todos()
    for todo in todos:
        if todo['id'] == todo_id:
            todo['completed'] = not todo['completed']
            break
    save_todos(todos)

def delete_todo(todo_id):
    """Delete a todo item"""
    todos = load_todos()
    todos = [todo for todo in todos if todo['id'] != todo_id]
    save_todos(todos)

def main():
    st.title("📝 Simple Todo List App")
    st.markdown("---")
    
    # Add new todo
    st.subheader("Add New Todo")
    new_todo_text = st.text_input("Enter a new todo item:", key="new_todo")
    
    if st.button("Add Todo"):
        if new_todo_text.strip():
            add_todo(new_todo_text.strip())
            st.success(f"Added: {new_todo_text}")
            st.rerun()
        else:
            st.error("Please enter a valid todo item!")
    
    st.markdown("---")
    
    # Display todos
    st.subheader("Your Todo List")
    todos = load_todos()
    
    if not todos:
        st.info("No todos yet! Add your first todo above.")
    else:
        for todo in todos:
            col1, col2, col3 = st.columns([0.7, 0.15, 0.15])
            
            with col1:
                if todo['completed']:
                    st.markdown(f"~~{todo['text']}~~ ✅")
                else:
                    st.markdown(f"{todo['text']}")
            
            with col2:
                if st.button("Toggle", key=f"toggle_{todo['id']}"):
                    toggle_todo(todo['id'])
                    st.rerun()
            
            with col3:
                if st.button("Delete", key=f"delete_{todo['id']}"):
                    delete_todo(todo['id'])
                    st.rerun()
    
    # Stats
    if todos:
        st.markdown("---")
        completed_count = sum(1 for todo in todos if todo['completed'])
        total_count = len(todos)
        st.metric("Progress", f"{completed_count}/{total_count} completed")

if __name__ == "__main__":
    main()