import { Model, DataTypes } from 'sequelize';

import sequelize from './db_connection';


class EditorDocument extends Model {
    declare id: BigInt;
    declare title: string;
}

EditorDocument.init({
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
    },
    title: DataTypes.STRING,
},
    {
        sequelize,
    },
);

export default EditorDocument;