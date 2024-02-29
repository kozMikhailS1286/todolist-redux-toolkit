import {todolistsApi} from "features/TodolistsList/api/todolistsApi";
import {appActions} from "app/app.reducer";
import {todolistsActions, todolistThunk} from "features/TodolistsList/todolists.reducer";
import {createSlice} from "@reduxjs/toolkit";
import {clearTasksAndTodolists} from "common/actions/common.actions";
import {createAppAsyncThunk} from "../../common/utils/index";
import {handleServerNetworkError} from "../../common/utils/index";
import {handleServerAppError} from "../../common/utils/index";
import {TaskPriorities, TaskStatuses} from "../../common/enums/enums";
import {TaskType, UpdateTaskModelType} from "./api/todolistsApi.types";

const initialState: TasksStateType = {};


const slice = createSlice({
    name: "tasks",
    initialState,
    reducers:{
        setTest: () => {}
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(addTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.task.todoListId];
                tasks.unshift(action.payload.task)
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId];
                const index = tasks.findIndex((t) => t.id === action.payload.taskId);
                if (index !== -1) {
                    tasks[index] = {...tasks[index], ...action.payload.domainModel};
                }
            })
            .addCase(removeTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId];
                const index = tasks.findIndex((t) => t.id === action.payload.taskId);
                if (index !== -1) tasks.splice(index, 1);
            })
            .addCase(todolistThunk.addTodolist.fulfilled, (state, action) => {

                state[action.payload.id] = [];
            })
            .addCase(todolistThunk.removeTodolist.fulfilled, (state, action) => {
                delete state[action.payload.id];
            })
            // .addCase(todolistsActions.setTodolists, (state, action) => {
            //     action.payload.todolists.forEach((tl) => {
            //         state[tl.id] = [];
            //     });
            // })
            .addCase(clearTasksAndTodolists, () => {
                return {};
            })
            .addCase(todolistThunk.fetchTodolist.fulfilled, (state, action) => {
                action.payload.forEach((tl) => {
                    state[tl.id] = []
                })
            })
    },
});


// thunks
// export const fetchTasksTC =
//   (todolistId: string): AppThunk =>
//   (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     todolistsApi.getTasks(todolistId).then((res) => {
//       const tasks = res.data.items;
//       dispatch(tasksActions.setTasks({ tasks, todolistId }));
//       dispatch(appActions.setAppStatus({ status: "succeeded" }));
//     });
//   };

const fetchTasks = createAppAsyncThunk<{tasks: TaskType[], todolistId: string}, string>(`${slice.name}/fetchTasks`,
    async (todolistId, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: 'loading'}))
            const res = await todolistsApi.getTasks(todolistId)
            const tasks = res.data.items
            // dispatch(tasksActions.setTasks({tasks, todolistId}))
            dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return {tasks, todolistId};
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            // return rejectWithValue(error.res.data)
            return rejectWithValue(null)
        }
    })


// export const addTaskTC =
//     (title: string, todolistId: string): AppThunk =>
//         (dispatch) => {
//             dispatch(appActions.setAppStatus({status: "loading"}));
//             todolistsApi
//                 .createTask(todolistId, title)
//                 .then((res) => {
//                     if (res.data.resultCode === 0) {
//                         const task = res.data.data.item;
//                         dispatch(tasksActions.addTask({task}));
//                         dispatch(appActions.setAppStatus({status: "succeeded"}));
//                     } else {
//                         handleServerAppError(res.data, dispatch);
//                     }
//                 })
//                 .catch((error) => {
//                     handleServerNetworkError(error, dispatch);
//                 });
//         };

const addTask = createAppAsyncThunk<{task: TaskType}, { title: string, todolistId: string }>(`${slice.name}/addTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsApi.createTask(arg.todolistId, arg.title)
            if (res.data.resultCode === 0) {
                const task = res.data.data.item;
                dispatch(appActions.setAppStatus({status: "succeeded"}));
                return {task}
            } else {
                handleServerNetworkError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })


const removeTask = createAppAsyncThunk<{taskId: string, todolistId: string},
    {taskId: string, todolistId: string}>(`${slice.name}/removeTask`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsApi.deleteTask(arg.todolistId, arg.taskId)
            if (res.data.resultCode === 0) {
                console.log(res)
                dispatch(appActions.setAppStatus({status: "succeeded"}));
                return {taskId: arg.taskId, todolistId:arg.todolistId}
            } else {
                handleServerNetworkError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch)
            return rejectWithValue(null)
        }
    })


// export const removeTaskTC =
//     (taskId: string, todolistId: string): AppThunk =>
//         (dispatch) => {
//             todolistsApi.deleteTask(todolistId, taskId).then(() => {
//                 dispatch(tasksActions.removeTask({taskId, todolistId}));
//             });
//         };

const updateTask = createAppAsyncThunk<{taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string},
    {taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string}>
('tasks/updateTask', async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue, getState} = thunkAPI
    try {
        dispatch(appActions.setAppStatus({status: 'loading'}))
        const state = getState()
        const task = state.tasks[arg.todolistId].find(t => t.id === arg.taskId)
        if (!task) {
            dispatch(appActions.setAppError({error: 'Task not found'}))
            return rejectWithValue(null)
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...arg.domainModel
        }

        const res = await todolistsApi.updateTask(arg.todolistId, arg.taskId, apiModel)
        if (res.data.resultCode === 0) {
            dispatch(appActions.setAppStatus({status: "succeeded"}));
            return {taskId: arg.taskId, domainModel: arg.domainModel, todolistId: arg.todolistId}

            // dispatch(appActions.setAppStatus({status: 'succeeded'}))
            // return arg

        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (e) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})


// export const updateTaskTC =
//     (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string): AppThunk =>
//         (dispatch, getState) => {
//             const state = getState();
//             const task = state.tasks[todolistId].find((t) => t.id === taskId);
//             if (!task) {
//                 //throw new Error("task not found in the state");
//                 console.warn("task not found in the state");
//                 return;
//             }
//
//             const apiModel: UpdateTaskModelType = {
//                 deadline: task.deadline,
//                 description: task.description,
//                 priority: task.priority,
//                 startDate: task.startDate,
//                 title: task.title,
//                 status: task.status,
//                 ...domainModel,
//             };
//
//             todolistsApi
//                 .updateTask(todolistId, taskId, apiModel)
//                 .then((res) => {
//                     if (res.data.resultCode === 0) {
//                         dispatch(tasksActions.updateTask({taskId, model: domainModel, todolistId}));
//                     } else {
//                         handleServerAppError(res.data, dispatch);
//                     }
//                 })
//                 .catch((error) => {
//                     handleServerNetworkError(error, dispatch);
//                 });
//         };

// types
export type UpdateDomainTaskModelType = {
    title?: string;
    description?: string;
    status?: TaskStatuses;
    priority?: TaskPriorities;
    startDate?: string;
    deadline?: string;
};
export type TasksStateType = {
    [key: string]: Array<TaskType>;
};


export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;

export const tasksThunks = {fetchTasks, addTask, updateTask, removeTask}