import {instance} from "../../../common/api/index";
import {GetTasksResponse, ResponseType, TaskType, TodolistType, UpdateTaskModelType} from "./todolistsApi.types";


// api
export const todolistsApi = {
  getTodolists() {
      return instance.get<TodolistType[]>("todo-lists");
  },
  createTodolist(title: string) {
      return instance.post<ResponseType<{ item: TodolistType }>>("todo-lists", { title: title });
  },
  deleteTodolist(id: string) {
      return instance.delete<ResponseType>(`todo-lists/${id}`);
  },
  updateTodolist(id: string, title: string) {
      return instance.put<ResponseType>(`todo-lists/${id}`, { title: title });
  },
  getTasks(todolistId: string) {
    return instance.get<GetTasksResponse>(`todo-lists/${todolistId}/tasks`);
  },
  deleteTask(todolistId: string, taskId: string) {
    return instance.delete<ResponseType>(`todo-lists/${todolistId}/tasks/${taskId}`);
  },
  createTask(todolistId: string, taskTitile: string) {
    return instance.post<ResponseType<{ item: TaskType }>>(`todo-lists/${todolistId}/tasks`, { title: taskTitile });
  },
  updateTask(todolistId: string, taskId: string, model: UpdateTaskModelType) {
    return instance.put<ResponseType<TaskType>>(`todo-lists/${todolistId}/tasks/${taskId}`, model);
  },
};