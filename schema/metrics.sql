/* This is table with JSONB events column, */
/* which holds timeseries data including user id and telegram command */

CREATE TABLE metrics (
    id date primary key default current_date,
    events jsonb
);

/* Necessary indexes for speed up the queries */

/* Silly usage with upsert */
/* Uncomment and copy paste below command */
/* INSERT INTO metrics (events) */
/* VALUES ( */
/*   jsonb_build_object((EXTRACT('EPOCH' FROM CURRENT_TIME) * 1000)::int4, */ 
/*     jsonb_build_object('user', '1', 'command', '/start')) */
/* ) */
/* ON CONFLICT (id) */
/* DO UPDATE SET events = metrics.events || jsonb_build_object((EXTRACT('EPOCH' FROM CURRENT_TIME) * 1000)::int4, */ 
/*   jsonb_build_object('user', '2', 'command', '/stop')); */
