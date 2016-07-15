--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.2
-- Dumped by pg_dump version 9.5.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: tweets; Type: TABLE; Schema: public; Owner: sardor
--

CREATE TABLE tweets (
    id bigint NOT NULL,
    text text,
    username text,
    screenname text,
    location text,
    avatar text,
    created_at timestamp without time zone
);


ALTER TABLE tweets OWNER TO sardor;

--
-- Name: tweets_id_seq; Type: SEQUENCE; Schema: public; Owner: sardor
--

CREATE SEQUENCE tweets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE tweets_id_seq OWNER TO sardor;

--
-- Name: tweets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: sardor
--

ALTER SEQUENCE tweets_id_seq OWNED BY tweets.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: sardor
--

ALTER TABLE ONLY tweets ALTER COLUMN id SET DEFAULT nextval('tweets_id_seq'::regclass);


--
-- Name: trig_new_tweet; Type: TRIGGER; Schema: public; Owner: sardor
--

CREATE TRIGGER trig_new_tweet AFTER INSERT ON tweets FOR EACH ROW EXECUTE PROCEDURE new_tweet_notify();


--
-- PostgreSQL database dump complete
--

