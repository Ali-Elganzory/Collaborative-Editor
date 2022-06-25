"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_connection_1 = __importDefault(require("./db_connection"));
class DocumentModel extends sequelize_1.Model {
}
DocumentModel.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    title: sequelize_1.DataTypes.STRING,
    content: sequelize_1.DataTypes.TEXT,
}, {
    sequelize: db_connection_1.default,
});
exports.default = DocumentModel;
