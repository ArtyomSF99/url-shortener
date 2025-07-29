import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAuth1753733183898 implements MigrationInterface {
    name = 'AddUserAuth1753733183898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "urls" ADD "user_id" character varying`);
        await queryRunner.query(`ALTER TABLE "urls" ADD CONSTRAINT "FK_5b194a4470977b71ff490dfc64b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "urls" DROP CONSTRAINT "FK_5b194a4470977b71ff490dfc64b"`);
        await queryRunner.query(`ALTER TABLE "urls" DROP COLUMN "user_id"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
