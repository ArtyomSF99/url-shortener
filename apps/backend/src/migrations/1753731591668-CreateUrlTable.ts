import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUrlTable1753731591668 implements MigrationInterface {
    name = 'CreateUrlTable1753731591668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "urls" ("id" character varying NOT NULL, "slug" character varying NOT NULL, "original_url" character varying NOT NULL, "visits" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c97a495e728c180054971888447" UNIQUE ("slug"), CONSTRAINT "PK_eaf7bec915960b26aa4988d73b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c97a495e728c18005497188844" ON "urls" ("slug") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_c97a495e728c18005497188844"`);
        await queryRunner.query(`DROP TABLE "urls"`);
    }

}
