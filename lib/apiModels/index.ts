export type LoginDataModel = { username: string; password: string };

export type UserModel = { username?: string; hashedPassword?: string; email: string };

export type AssetModel = {  id: string;};

export type JobsModel = {  id: string;  name: string;  timestamp: Date;};