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
-- Name: subscribers; Type: TABLE; Schema: public; Owner: sardor
--

CREATE TABLE subscribers (
    id bigint NOT NULL,
    username text,
    first_name text,
    active boolean DEFAULT true,
    subscribed_at timestamp without time zone
);


ALTER TABLE subscribers OWNER TO sardor;

--
-- Name: subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: sardor
--

ALTER TABLE ONLY subscribers
    ADD CONSTRAINT subscribers_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

