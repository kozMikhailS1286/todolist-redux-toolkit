import {
    TodolistDomainType,
    todolistsReducer, todolistThunk,
} from "features/TodolistsList/todolists.reducer";
import { tasksReducer, TasksStateType } from "features/TodolistsList/tasks.reducer";
import {TodolistType} from "./api/todolistsApi.types";

test("ids should be equals", () => {
    const startTasksState: TasksStateType = {};
    const startTodolistsState: Array<TodolistDomainType> = [];

    let todolist: TodolistType = {
        title: "new todolist",
        id: "any id",
        addedDate: "",
        order: 0,
    };

    const action = todolistThunk.addTodolist.fulfilled( todolist ,
        'req', {title: 'test'}, {} );

    const endTasksState = tasksReducer(startTasksState, action);
    const endTodolistsState = todolistsReducer(startTodolistsState, action);

    const keys = Object.keys(endTasksState);
    const idFromTasks = keys[0];
    const idFromTodolists = endTodolistsState[0].id;

    expect(idFromTasks).toBe(action.payload.id);
    expect(idFromTodolists).toBe(action.payload.id);
});
