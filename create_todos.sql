-- foreign_key 활성화
pragma foreign_keys=1;

DROP TABLE IF EXISTS todo;

-- SUBTODO 와 one-to-many 관계
CREATE TABLE todo(
	id integer primary key autoincrement,
	name text not null,
    done boolean not null default 0,
    created text not null default (datetime('now','localtime')),
    updated text not null default (datetime('now','localtime'))
);

DROP TABLE IF EXISTS subtodo;

-- TODO 와 many-to-one 관계
CREATE TABLE subtodo(
	id integer primary key autoincrement,
    sub_id integer not null,
    -- 순서에 주의: 참조 컬럼은 맨 뒤에 작성됨
	grp_id integer not null,
    -- for cascade
    constraint grptodo_fk foreign key(grp_id) references todo(id),
    constraint subtodo_fk foreign key(sub_id) references todo(id)
);

INSERT INTO todo(id, name, done, created, updated) VALUES
	(11, '면도기 제품', 0, '2022-04-04 12:00:00', '2022-04-11 12:00:00'),
	(12, '리필면도날 4개입', 0, '2022-04-05 12:00:00', '2022-04-09 12:00:00'),
	(13, '면도기 스타터세트', 1, '2022-04-06 12:00:00', '2022-04-12 12:00:00'),
	(14, '쉐이빙젤 150mL', 0, '2022-04-07 12:00:00', '2022-04-07 12:00:00'),
	(15, '애프터쉐이브 60mL', 0, '2022-04-08 12:00:00', '2022-04-08 12:00:00'),
	(16, '면도기 핸들+트래블 커버', 0, '2022-04-09 12:00:00', '2022-04-11 12:00:00'),
	(17, '면도기 트래블 커버', 1, '2022-04-10 12:00:00', '2022-04-11 12:00:00')
;

INSERT INTO subtodo(id, grp_id, sub_id) VALUES
	(1001, 11, 12),
	(1002, 11, 13),
	(1003, 11, 16),
	(1004, 11, 17)
;

-- autoincrement 시작 위치 지정
DELETE FROM sqlite_sequence WHERE name='todo';
INSERT INTO sqlite_sequence(name, seq) VALUES('todo', 40);

DELETE FROM sqlite_sequence WHERE name='subtodo';
INSERT INTO sqlite_sequence(name, seq) VALUES('subtodo', 1010);

-- ERROR: primary 또는 unique 제약이 없으면 conflict가 작동 안함
-- 참고) upsert 문법이 없음
-- INSERT INTO sqlite_sequence(name, seq) VALUES('todo',10)
-- ON CONFLICT(name) DO NOTHING;

-- 1) 스크립트 실행
-- sqlite3 todos.db < create_todos.sql

-- 2) 내용 확인
-- sqlite3 todos.db -header -column
-- > pragma table_info('todo');
-- > select * from todo;
