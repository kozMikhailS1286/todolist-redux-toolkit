import { todolistsApi } from "features/TodolistsList/api/todolistsApi";
import { appActions, RequestStatusType } from "app/app.reducer";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearTasksAndTodolists } from "common/actions/common.actions";
import {handleServerNetworkError} from "../../common/utils/index";
import {TodolistType} from "./api/todolistsApi.types";
import {createAppAsyncThunk} from "../../common/utils/index";

const initialState: TodolistDomainType[] = [];

const slice = createSlice({
    name: "todo",
    initialState,
    reducers: {
        // removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
        //     const index = state.findIndex((todo) => todo.id === action.payload.id);
        //     if (index !== -1) state.splice(index, 1);
        //     // return state.filter(tl => tl.id !== action.payload.id)
        // },
        // addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
        //   const newTodolist: TodolistDomainType = { ...action.payload.todolist, filter: "all", entityStatus: "idle" };
        //   state.unshift(newTodolist);
        // },
        // changeTodolistTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
        //     const todo = state.find((todo) => todo.id === action.payload.id);
        //     if (todo) {
        //         todo.title = action.payload.title;
        //     }
        // },
        changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
            const todo = state.find((todo) => todo.id === action.payload.id);
            if (todo) {
                todo.filter = action.payload.filter;
            }
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; entityStatus: RequestStatusType }>) => {
            const todo = state.find((todo) => todo.id === action.payload.id);
            if (todo) {
                todo.entityStatus = action.payload.entityStatus;
            }
        },
        // setTodolists: (state, action: PayloadAction<{ todolists: TodolistType[] }>) => {
        //   return action.payload.todolists.map((tl) => ({ ...tl, filter: "all", entityStatus: "idle" }));
        //   // return action.payload.forEach(t => ({...t, filter: 'active', entityStatus: 'idle'}))
        // },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addTodolist.fulfilled, (state: TodolistDomainType[], action) => {
                const newTodolist: TodolistDomainType = {...action.payload, filter: "all", entityStatus: "idle"};
                state.unshift(newTodolist);
            })
            .addCase(clearTasksAndTodolists, () => {
                return [];
            })
            .addCase(fetchTodolist.fulfilled, (state, action) => {
                return action.payload.map((tl) => ({...tl, filter: "all", entityStatus: "idle"}));
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                return state.filter(tl => tl.id !== action.payload.id)
            })
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const todo = state.find((todo) => todo.id === action.payload.id);
                if (todo) {
                    todo.title = action.payload.title;
                }
            })
    },
});

// const tasks = state[action.payload.task.todoListId];
// tasks.unshift(action.payload.task)

// thunks
// export const fetchTodolistsTC = (): AppThunk => {
//   return (dispatch) => {
//     dispatch(appActions.setAppStatus({ status: "loading" }));
//     todolistsApi
//       .getTodolists()
//       .then((res) => {
//         dispatch(todolistsActions.setTodolists({ todolists: res.data }));
//         dispatch(appActions.setAppStatus({ status: "succeeded" }));
//       })
//       .catch((error) => {
//         handleServerNetworkError(error, dispatch);
//       });
//   };
// };


const fetchTodolist = createAppAsyncThunk<TodolistType[], void>(`${slice.name}/fetchTodolist`,
    async (_, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            const res = await todolistsApi.getTodolists()
            const todolists = res.data
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return todolists
        } catch (error) {
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    })


// export const addTodolistTC = (title: string): AppThunk => {
//     return (dispatch) => {
//         dispatch(appActions.setAppStatus({ status: "loading" }));
//         todolistsApi.createTodolist(title).then((res) => {
//             dispatch(todolistsActions.addTodolist({ todolist: res.data.data.item }));
//             dispatch(appActions.setAppStatus({ status: "succeeded" }));
//         });
//     };
// };


const addTodolist = createAppAsyncThunk<TodolistType, {title: string}>(`${slice.name}/addTodolist`,
    async (arg, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({status: "loading"}));
            const res = await todolistsApi.createTodolist(arg.title)
            const todolist = res.data.data.item
            dispatch(appActions.setAppStatus({status: "succeeded"}));
            return todolist
        } catch (error) {
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    })


// export const removeTodolistTC = (id: string): AppThunk => {
//     return (dispatch) => {
//         //изменим глобальный статус приложения, чтобы вверху полоса побежала
//         dispatch(appActions.setAppStatus({ status: "loading" }));
//         //изменим статус конкретного тудулиста, чтобы он мог задизеблить что надо
//         dispatch(todolistsActions.changeTodolistEntityStatus({ id, entityStatus: "loading" }));
//         todolistsApi.deleteTodolist(id).then((res) => {
//             dispatch(todolistsActions.removeTodolist({ id }));
//             //скажем глобально приложению, что асинхронная операция завершена
//             dispatch(appActions.setAppStatus({ status: "succeeded" }));
//         });
//     };
// };

const removeTodolist = createAppAsyncThunk<{id: string}, {id: string}>(`${slice.name}/removeTodolist`,
    async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            dispatch(todolistsActions.changeTodolistEntityStatus({ id: arg.id, entityStatus: "loading" })); // ???
            const res = await todolistsApi.deleteTodolist(arg.id)
            if (res.data.resultCode === 0) {
                dispatch(appActions.setAppStatus({ status: "succeeded" }));
                return {id: arg.id}
            } else {
                handleServerNetworkError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    })


// export const changeTodolistTitleTC = (id: string, title: string): AppThunk => {
//     return (dispatch) => {
//         todolistsApi.updateTodolist(id, title).then((res) => {
//             dispatch(todolistsActions.changeTodolistTitle({ id, title }));
//         });
//     };
// };


const changeTodolistTitle = createAppAsyncThunk<{id: string, title: string}, {id: string, title: string}>(`${slice.name}/changeTodolistTitle`,
    async (arg, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
        try {
            const res = await todolistsApi.updateTodolist(arg.id, arg.title)
            if (res.data.resultCode === 0) {
                return {id: arg.id, title: arg.title}
            } else {
                handleServerNetworkError(res.data, dispatch)
                return rejectWithValue(null)
            }
        } catch (error) {
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    })





// types
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
  filter: FilterValuesType;
  entityStatus: RequestStatusType;
};


export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todolistThunk = {fetchTodolist, addTodolist, removeTodolist, changeTodolistTitle}
