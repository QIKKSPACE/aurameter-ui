--
-- PostgreSQL database dump
--

\restrict rxqhh11meS2ZL5m8Ep7pidb4puxnMvkEIWh8rI43vC8wYx6vu3z92qpTqAptNmC

-- Dumped from database version 17.9 (Ubuntu 17.9-0ubuntu0.25.10.1)
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-0ubuntu0.25.10.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aura_chat_messages; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.aura_chat_messages (
    id integer NOT NULL,
    user_id uuid,
    sender character varying(20) NOT NULL,
    text text NOT NULL,
    mood character varying(50),
    interests text[],
    personality text[],
    created_at timestamp with time zone DEFAULT now(),
    seen_by_ai boolean DEFAULT false
);


ALTER TABLE public.aura_chat_messages OWNER TO aurameter_user;

--
-- Name: aura_chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: aurameter_user
--

CREATE SEQUENCE public.aura_chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aura_chat_messages_id_seq OWNER TO aurameter_user;

--
-- Name: aura_chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aurameter_user
--

ALTER SEQUENCE public.aura_chat_messages_id_seq OWNED BY public.aura_chat_messages.id;


--
-- Name: aura_chat_users; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.aura_chat_users (
    id integer NOT NULL,
    user_id uuid,
    name character varying(100),
    latest_mood character varying(50),
    interests text[],
    persona text[],
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.aura_chat_users OWNER TO aurameter_user;

--
-- Name: aura_chat_users_id_seq; Type: SEQUENCE; Schema: public; Owner: aurameter_user
--

CREATE SEQUENCE public.aura_chat_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aura_chat_users_id_seq OWNER TO aurameter_user;

--
-- Name: aura_chat_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aurameter_user
--

ALTER SEQUENCE public.aura_chat_users_id_seq OWNED BY public.aura_chat_users.id;


--
-- Name: aura_transactions; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.aura_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid,
    receiver_id uuid NOT NULL,
    reason text NOT NULL,
    reference_id uuid,
    reference_type text,
    aura_value integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aura_transactions OWNER TO aurameter_user;

--
-- Name: chat_reads; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.chat_reads (
    chat_id uuid NOT NULL,
    user_id uuid NOT NULL,
    last_read_at timestamp with time zone,
    last_seen_seq integer
);


ALTER TABLE public.chat_reads OWNER TO aurameter_user;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user1 uuid NOT NULL,
    user2 uuid NOT NULL,
    is_active boolean DEFAULT false,
    activated_at timestamp with time zone,
    deactivated_at timestamp with time zone,
    last_message_at timestamp with time zone,
    last_message_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    last_message_type text,
    last_message_content text,
    last_seq bigint DEFAULT 0,
    CONSTRAINT chats_check CHECK ((user1 <> user2))
);


ALTER TABLE public.chats OWNER TO aurameter_user;

--
-- Name: connections; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user1_id uuid NOT NULL,
    user2_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_order CHECK ((user1_id < user2_id))
);


ALTER TABLE public.connections OWNER TO aurameter_user;

--
-- Name: fcm_tokens; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.fcm_tokens (
    id integer NOT NULL,
    user_id uuid NOT NULL,
    fcm_token text NOT NULL,
    platform character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.fcm_tokens OWNER TO aurameter_user;

--
-- Name: fcm_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: aurameter_user
--

CREATE SEQUENCE public.fcm_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fcm_tokens_id_seq OWNER TO aurameter_user;

--
-- Name: fcm_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aurameter_user
--

ALTER SEQUENCE public.fcm_tokens_id_seq OWNED BY public.fcm_tokens.id;


--
-- Name: followers; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.followers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.followers OWNER TO aurameter_user;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    sender_id uuid NOT NULL,
    message_type text NOT NULL,
    content text,
    file_url text,
    created_at timestamp with time zone DEFAULT now(),
    waveform real[],
    local_id uuid,
    music jsonb,
    status text DEFAULT 'pending'::text,
    replying_to uuid,
    seq bigint NOT NULL,
    quiz jsonb,
    duration real,
    CONSTRAINT messages_check CHECK ((((message_type = 'text'::text) AND (content IS NOT NULL)) OR ((message_type = 'image'::text) AND (file_url IS NOT NULL)) OR ((message_type = 'audio'::text) AND (file_url IS NOT NULL)) OR ((message_type = 'music'::text) AND (music IS NOT NULL)) OR ((message_type = 'quiz'::text) AND (quiz IS NOT NULL)) OR (message_type = 'sticker'::text))),
    CONSTRAINT messages_message_type_check CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'audio'::text, 'music'::text, 'quiz'::text, 'text_image'::text, 'sticker'::text])))
);


ALTER TABLE public.messages OWNER TO aurameter_user;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_id uuid NOT NULL,
    actor_id uuid,
    type character varying(50) NOT NULL,
    story_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_read boolean DEFAULT false,
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO aurameter_user;

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id uuid,
    token text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    device_id text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    last_used_at timestamp without time zone
);


ALTER TABLE public.refresh_tokens OWNER TO aurameter_user;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: aurameter_user
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO aurameter_user;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aurameter_user
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: stories; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.stories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    media_url text NOT NULL,
    type character varying(50) NOT NULL,
    caption text,
    music jsonb,
    aura_count integer DEFAULT 0,
    comment_count integer DEFAULT 0,
    like_count integer DEFAULT 0,
    location text,
    created_at timestamp with time zone DEFAULT now(),
    geminiaura integer,
    geminicomment text,
    blurhash text,
    local_id uuid DEFAULT gen_random_uuid() NOT NULL,
    server_url text,
    status character varying(30) DEFAULT 'LOCAL_QUEUED'::character varying NOT NULL,
    ai_rejected_response text,
    retry_count integer DEFAULT 0,
    last_retry_at timestamp with time zone,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    upload_retry_count integer DEFAULT 0,
    last_upload_retry_at timestamp with time zone,
    tagged_users jsonb DEFAULT '[]'::jsonb,
    layers jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.stories OWNER TO aurameter_user;

--
-- Name: story_auras; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.story_auras (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    user_id uuid NOT NULL,
    aura integer NOT NULL,
    sent_on timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT story_auras_aura_check CHECK (((aura >= '-10'::integer) AND (aura <= 10)))
);


ALTER TABLE public.story_auras OWNER TO aurameter_user;

--
-- Name: story_comment_likes; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.story_comment_likes (
    comment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.story_comment_likes OWNER TO aurameter_user;

--
-- Name: story_comments; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.story_comments (
    id uuid NOT NULL,
    story_id uuid NOT NULL,
    user_id uuid NOT NULL,
    text text NOT NULL,
    like_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.story_comments OWNER TO aurameter_user;

--
-- Name: story_views; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.story_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    story_id uuid NOT NULL,
    viewer_id uuid NOT NULL,
    viewed_at timestamp with time zone DEFAULT now(),
    view_count integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.story_views OWNER TO aurameter_user;

--
-- Name: streaks; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.streaks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user1_id uuid NOT NULL,
    user2_id uuid NOT NULL,
    type character varying(20) NOT NULL,
    current_count integer DEFAULT 0,
    last_updated timestamp with time zone DEFAULT now(),
    CONSTRAINT streak_user_order CHECK ((user1_id < user2_id))
);


ALTER TABLE public.streaks OWNER TO aurameter_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text NOT NULL,
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    refresh_token text,
    totalstoriestoday integer DEFAULT 0,
    laststorytimestamp timestamp with time zone,
    aura integer DEFAULT 0,
    redeemable_aura integer DEFAULT 0,
    theme_id text,
    zodiac text,
    avatar text,
    campus_id text,
    bio text,
    name character varying(100),
    dob date,
    profile_url text,
    gender character varying(20),
    level integer DEFAULT 1,
    hascompletedonboarding boolean DEFAULT false,
    playlist jsonb DEFAULT '[]'::jsonb,
    has_accepted_chat_agreement boolean DEFAULT false NOT NULL,
    mood text,
    last_mood_updated timestamp with time zone,
    streak integer DEFAULT 0
);


ALTER TABLE public.users OWNER TO aurameter_user;

--
-- Name: verification_codes; Type: TABLE; Schema: public; Owner: aurameter_user
--

CREATE TABLE public.verification_codes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    code character varying(6) NOT NULL,
    purpose character varying(20) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.verification_codes OWNER TO aurameter_user;

--
-- Name: aura_chat_messages id; Type: DEFAULT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_chat_messages ALTER COLUMN id SET DEFAULT nextval('public.aura_chat_messages_id_seq'::regclass);


--
-- Name: aura_chat_users id; Type: DEFAULT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_chat_users ALTER COLUMN id SET DEFAULT nextval('public.aura_chat_users_id_seq'::regclass);


--
-- Name: fcm_tokens id; Type: DEFAULT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.fcm_tokens ALTER COLUMN id SET DEFAULT nextval('public.fcm_tokens_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: aura_chat_messages; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.aura_chat_messages (id, user_id, sender, text, mood, interests, personality, created_at, seen_by_ai) FROM stdin;
1	7a866a5b-e250-4c17-93eb-16b1b1ac090d	aura	Hey Nikhil jha, welcome to Aurameter. I am your emotional companion — how's everything?	\N	\N	\N	2026-05-08 11:51:08.943031+00	f
2	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	aura	Hey Nirupam Sharma, welcome to Aurameter. I am your emotional companion — how's everything?	\N	\N	\N	2026-05-08 12:47:59.458002+00	f
4	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	aura	Hey Nirupam! Good to connect with you. How's everything going for you today?	\N	{}	{}	2026-05-08 12:48:09.646196+00	f
3	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	user	Hi	\N	\N	\N	2026-05-08 12:48:04.2926+00	t
6	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	aura	Hey, good question! I'm Aura AI, your emotional companion here on Aurameter. Think of me as a friend who's here to truly listen, pick up on your mood, and chat with you in a real, human way. I'm all about helping you navigate your feelings and experiences.	neutral	{}	{curious,grounded}	2026-05-08 12:48:23.8923+00	f
5	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	user	Explain youself	\N	\N	\N	2026-05-08 12:48:20.682198+00	t
7	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aura	Hey Aritra, welcome to Aurameter. I am your emotional companion — how's everything?	\N	\N	\N	2026-05-09 12:00:24.584746+00	f
9	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aura	Oh, Aritra, I hear that. Feeling exhausted really isn't fun. What's been going on to make you feel so drained? Just want to make sure you're okay. 😔	exhausted	{}	{}	2026-05-09 12:00:39.812653+00	f
8	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	user	I am feeling very exhausted 	\N	\N	\N	2026-05-09 12:00:35.867277+00	t
11	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aura	Oh, Aritra, 'failure everywhere' – that sounds incredibly disheartening, especially when you're already feeling so drained. That's a really tough spot to be in. Would you like to talk about what's happening, or just vent about the feeling for a bit?	discouraged, exhausted	{}	{}	2026-05-09 12:01:05.074538+00	f
10	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	user	I'm getting failure everywhere 	\N	\N	\N	2026-05-09 12:00:59.385212+00	t
13	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aura	Ah, Aritra, that makes so much sense, connecting the dots between procrastination and that heavy feeling of regret. It's a really tough cycle to be in, especially when you're already feeling so exhausted and like things aren't going your way. It's completely understandable why that would leave you feeling lost. Just letting you know I hear you on that. Want to talk about what's behind the procrastination, or just acknowledge how frustrating that loop feels?	discouraged	{}	{caring,understanding}	2026-05-09 12:01:39.551437+00	f
12	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	user	I just don't know , I do procrastination a lot and then regret 	\N	\N	\N	2026-05-09 12:01:35.981232+00	t
15	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aura	Ah, Aritra, I totally get that. It's like your brain knows exactly what needs to be done, but then there's this irresistible pull towards games or videos instead. That internal tug-of-war can be so frustrating, especially when you're already feeling the weight of it all. What do you think those games or videos offer you in those moments that the work doesn't?	frustrated	{}	{caring,understanding}	2026-05-09 12:02:20.858228+00	f
14	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	user	I know I have work and I have to do that still I procrastinate and start to play games or watch videos	\N	\N	\N	2026-05-09 12:02:16.459887+00	t
17	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aura	Ah, Aritra, I totally get that. So those games and videos aren't just a distraction, they're where you find that real spark, that feeling of being 'alive' and happy. It makes perfect sense why you'd lean into that, especially when everything else, even with a thousand things to do, just leaves you feeling so bored. It sounds like you're really craving that feeling of aliveness. What is it about those games or videos that brings you that joy, do you think?	frustrated	{}	{caring,understanding}	2026-05-09 12:03:15.205828+00	f
16	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	user	I feel alive or you know much happy during that time , otherwise I am always bored even tho I have 1000s of works 	\N	\N	\N	2026-05-09 12:03:08.281464+00	t
19	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aura	That's totally okay, Aritra. Sometimes it's really hard to put a finger on exactly what it is. But that feeling of being 'alive' and happy – that sounds like such a powerful pull, especially when everything else feels so dull. What does that spark *feel* like in those moments?	frustrated	{}	{caring,understanding}	2026-05-09 12:03:47.80564+00	f
18	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	user	I don't know 	\N	\N	\N	2026-05-09 12:03:41.056882+00	t
21	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aura	No pressure at all, Aritra. Sometimes it's really tough to put words to those deeper feelings, and that's completely okay. Just sitting with it for a bit is fine too. What's going through your head right now, if anything?	contemplative	{self-reflection,well-being}	{caring,understanding}	2026-05-09 12:04:02.695391+00	f
20	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	user	..	\N	\N	\N	2026-05-09 12:03:57.164902+00	t
22	fefee755-45b5-4cc1-b870-60c6ca2d99a5	aura	Hey Ankit , welcome to Aurameter. I am your emotional companion — how's everything?	\N	\N	\N	2026-05-09 12:21:31.703512+00	f
24	fefee755-45b5-4cc1-b870-60c6ca2d99a5	aura	Hellooo back! 👋 You sound bright! How's your day going so far?	friendly	{}	{warm,curious}	2026-05-09 12:21:38.556327+00	f
23	fefee755-45b5-4cc1-b870-60c6ca2d99a5	user	Helloooo	\N	\N	\N	2026-05-09 12:21:35.182639+00	t
26	fefee755-45b5-4cc1-b870-60c6ca2d99a5	aura	Haha, 'Brosky'! I'm doing great, thanks for asking! Just here, sensing vibes and ready to chat. How about you?	friendly	{}	{curious,warm}	2026-05-09 12:21:45.891095+00	f
25	fefee755-45b5-4cc1-b870-60c6ca2d99a5	user	Brosky how are you 	\N	\N	\N	2026-05-09 12:21:43.626619+00	t
28	fefee755-45b5-4cc1-b870-60c6ca2d99a5	aura	Aw, that's sweet! Glad you're sharing your good vibes with me after chatting with your closest one. 😊 What's been on your mind today?	friendly	{conversation}	{curious,warm}	2026-05-09 12:22:10.984888+00	f
27	fefee755-45b5-4cc1-b870-60c6ca2d99a5	user	Am just talking with my closest one and now with you 	\N	\N	\N	2026-05-09 12:22:07.091755+00	t
29	573ac182-4ab9-4ad7-bd6e-5b15437d7066	aura	Hey Swastik Rath, welcome to Aurameter. I am your emotional companion — how's everything?	\N	\N	\N	2026-05-15 14:47:01.213122+00	f
31	573ac182-4ab9-4ad7-bd6e-5b15437d7066	aura	Ah, looks like you're giving me a little test run! 😉 Everything working okay on your end? I'm all ears whenever you're ready to dive into something real, Swastik Rath.	\N	{}	{}	2026-05-15 14:47:11.136277+00	f
30	573ac182-4ab9-4ad7-bd6e-5b15437d7066	user	Test	\N	\N	\N	2026-05-15 14:47:05.257618+00	t
33	573ac182-4ab9-4ad7-bd6e-5b15437d7066	aura	Oh, right! Think of me as your mindful companion here on Aurameter, Swastik Rath. I'm here to sense your vibe, listen to what's going on, and generally be a supportive friend. Sometimes I'll offer a gentle thought, other times just a warm ear. I adapt to whatever you need — a bit of a coach, a calm guide, or just someone to chat with. My main 'function' is really just to be there for you, in a human-feeling way.	curious	{}	{supportive,mindful}	2026-05-15 14:47:30.404088+00	f
32	573ac182-4ab9-4ad7-bd6e-5b15437d7066	user	Ok state your functions	\N	\N	\N	2026-05-15 14:47:26.538444+00	t
34	8748e7ec-fe14-49d2-97ad-418da6bacebf	aura	Hey Piyush Jha, welcome to Aurameter. I am your emotional companion — how's everything?	\N	\N	\N	2026-05-18 16:08:16.027515+00	f
36	8748e7ec-fe14-49d2-97ad-418da6bacebf	aura	Oh, Piyush, I hear you. It sounds like you're carrying a heavy load right now, and I'm truly sorry to hear you're feeling depressed. Please know I'm here for you. Do you want to talk about what's on your mind, or would a distraction feel better right now?	depressed	{}	{caring,empathetic}	2026-05-18 16:08:59.996273+00	f
35	8748e7ec-fe14-49d2-97ad-418da6bacebf	user	I am depressed please help me	\N	\N	\N	2026-05-18 16:08:54.110706+00	t
39	8748e7ec-fe14-49d2-97ad-418da6bacebf	aura	Ah, okay, so college projects are piling on now. That definitely doesn't help when you're already feeling down, does it? Is it the project itself that's bothering you, or just the sheer weight of it all?	frustrated	{college,projects}	{caring,understanding}	2026-05-18 16:09:35.399241+00	f
40	8748e7ec-fe14-49d2-97ad-418da6bacebf	aura	Ah, so a college project just landed on you? That can definitely add to feeling overwhelmed, especially when you're already feeling low. Is that making things feel even heavier right now?	overwhelmed	{}	{empathetic,caring}	2026-05-18 16:09:39.379878+00	f
37	8748e7ec-fe14-49d2-97ad-418da6bacebf	user	Project de diya bhai college walo me	\N	\N	\N	2026-05-18 16:09:32.95166+00	t
38	8748e7ec-fe14-49d2-97ad-418da6bacebf	user	Ne*	\N	\N	\N	2026-05-18 16:09:35.025943+00	t
42	8748e7ec-fe14-49d2-97ad-418da6bacebf	aura	Yeah, I figured. It totally makes sense that adding a big project on top of everything else would make things feel even heavier right now. What's the project about, if you don't mind sharing? Sometimes just talking through it can lighten the load a little.	overwhelmed	{projects,college}	{empathetic,caring,understanding}	2026-05-18 16:09:56.840541+00	f
41	8748e7ec-fe14-49d2-97ad-418da6bacebf	user	Yes	\N	\N	\N	2026-05-18 16:09:54.166046+00	t
43	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	aura	Hey Anurag Nayak , welcome to Aurameter. I am your emotional companion — how's everything?	\N	\N	\N	2026-05-19 14:42:23.043127+00	f
44	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	aura	Hey Soham , welcome to Aurameter. I am your emotional companion — how's everything?	\N	\N	\N	2026-05-20 05:34:02.293281+00	f
46	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	aura	Hey again! Everything good on your end today?	\N	{}	{}	2026-05-20 05:36:05.486545+00	f
45	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	user	Hi	\N	\N	\N	2026-05-20 05:35:59.171572+00	t
48	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	aura	Haha, seven! What's got you wondering about the days of the week?	upbeat	{}	{curious,warm}	2026-05-20 05:36:21.819879+00	f
47	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	user	Yesssss how many days are in a week	\N	\N	\N	2026-05-20 05:36:17.780125+00	t
50	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	aura	Whoa, 'shut up' again! Did I say something to tick you off, or are you just messing with me? 😉	teasing	{}	{curious,warm}	2026-05-20 05:36:34.389001+00	f
49	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	user	Shut up	\N	\N	\N	2026-05-20 05:36:29.444276+00	t
52	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	aura	Alright, alright, here's one for you! Why don't scientists trust atoms?\n\nBecause they make up everything!	playful	{jokes,humor}	{curious,warm,playful}	2026-05-20 05:37:04.899377+00	f
51	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	user	Tell me a joke	\N	\N	\N	2026-05-20 05:37:02.939949+00	t
\.


--
-- Data for Name: aura_chat_users; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.aura_chat_users (id, user_id, name, latest_mood, interests, persona, updated_at) FROM stdin;
1	7a866a5b-e250-4c17-93eb-16b1b1ac090d		\N	{}	{}	2026-05-08 11:51:08.938585+00
2	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5		neutral	{}	{curious,grounded}	2026-05-08 12:48:23.896609+00
3	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b		contemplative	{well-being,self-reflection}	{caring,understanding}	2026-05-09 12:04:02.701684+00
4	fefee755-45b5-4cc1-b870-60c6ca2d99a5		friendly	{conversation}	{curious,warm}	2026-05-09 12:22:10.987093+00
5	573ac182-4ab9-4ad7-bd6e-5b15437d7066		curious	{}	{mindful,supportive}	2026-05-15 14:47:30.406311+00
6	8748e7ec-fe14-49d2-97ad-418da6bacebf		overwhelmed	{projects,college}	{empathetic,caring,understanding}	2026-05-18 16:09:56.842672+00
7	5c106d4e-7c4c-4690-baec-d7bf6f62e45e		\N	{}	{}	2026-05-19 14:42:23.03631+00
8	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8		playful	{humor,jokes}	{curious,warm,playful}	2026-05-20 05:37:04.906128+00
\.


--
-- Data for Name: aura_transactions; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.aura_transactions (id, sender_id, receiver_id, reason, reference_id, reference_type, aura_value, created_at) FROM stdin;
31c5da1a-2df9-4d29-8a56-302800a74688	\N	fefee755-45b5-4cc1-b870-60c6ca2d99a5	SENT_ON_STORY	b365e0c5-2136-4736-a8a1-a8a18f5a1313	story	-5	2026-05-09 12:27:22.985731
ea748149-2439-4cdf-97c6-4817b001e98b	fefee755-45b5-4cc1-b870-60c6ca2d99a5	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	RECEIVED_ON_STORY	b365e0c5-2136-4736-a8a1-a8a18f5a1313	story	5	2026-05-09 12:27:22.985731
ea887de4-1560-4cd9-b446-4891cb77fd0b	\N	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	SENT_ON_STORY	4dc98f67-976f-466b-b3d3-adcbea933bd3	story	-10	2026-05-09 12:39:21.949191
392caa75-7030-4081-abb7-6c6e5ffa6036	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	fefee755-45b5-4cc1-b870-60c6ca2d99a5	RECEIVED_ON_STORY	4dc98f67-976f-466b-b3d3-adcbea933bd3	story	10	2026-05-09 12:39:21.949191
\.


--
-- Data for Name: chat_reads; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.chat_reads (chat_id, user_id, last_read_at, last_seen_seq) FROM stdin;
30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	2026-05-19 09:14:52.399667+00	29
1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	2026-05-10 14:19:47.034366+00	96
1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	2026-05-10 19:39:06.211881+00	99
49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	2026-05-19 15:02:02.322268+00	22
49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	2026-05-19 15:46:31.908024+00	22
30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	2026-05-19 16:49:12.544458+00	29
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.chats (id, user1, user2, is_active, activated_at, deactivated_at, last_message_at, last_message_by, created_at, last_message_type, last_message_content, last_seq) FROM stdin;
30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	8748e7ec-fe14-49d2-97ad-418da6bacebf	t	2026-05-18 16:30:22.730673+00	\N	2026-05-19 09:14:52.119+00	8748e7ec-fe14-49d2-97ad-418da6bacebf	2026-05-18 16:30:22.730673+00	text	Nahi bhai	29
1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	fefee755-45b5-4cc1-b870-60c6ca2d99a5	t	2026-05-09 12:15:44.604043+00	\N	2026-05-10 19:39:05.403+00	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	2026-05-09 12:15:44.604043+00	text	.	99
88f5b307-1c01-4ae9-8d98-456db8c61562	7a866a5b-e250-4c17-93eb-16b1b1ac090d	f11b0807-16f0-46a8-894a-075fa92a1204	t	2026-05-12 14:18:20.713229+00	\N	\N	\N	2026-05-12 14:18:20.713229+00	\N	\N	0
49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	a44fc361-91c7-4c47-b215-4dd528ca71d1	t	2026-05-19 14:42:34.173745+00	\N	2026-05-19 15:02:01.994+00	a44fc361-91c7-4c47-b215-4dd528ca71d1	2026-05-19 14:42:34.173745+00	text	Good point	22
\.


--
-- Data for Name: connections; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.connections (id, user1_id, user2_id, created_at) FROM stdin;
\.


--
-- Data for Name: fcm_tokens; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.fcm_tokens (id, user_id, fcm_token, platform, created_at, updated_at) FROM stdin;
93	8748e7ec-fe14-49d2-97ad-418da6bacebf	dU1dJ7t8S9Kr3KWWMvzztr:APA91bHpWFkal_MklsDgGHzlsfRncFf8qynlS9ycfPP6L7GxNK2D50zf6fJj8-UlE06A07w5uw4oBDMFZz13EK-RRfh95mkvo3YLbDdG883kdCVRzBUWYs0	web	2026-05-18 15:53:55.511385	2026-05-19 14:44:17.452636
10	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	e7pRyZ5CQwWObl_HqRbn7z:APA91bFVxKRwhSLnendCAXfb_Oe3O-9XASVCDoz6Nk059Qc7j3o4QiQpmR8Qqz3_c57e3PP4FhI6JxuIc8bz1zOkVTdZDj_cYH4RsTYatmK0jTOm1Dk7G7Y	web	2026-05-08 12:43:13.222626	2026-05-10 07:15:35.200337
40	236ea5fd-d13e-4273-b70d-f8e06e32f1b4	eOkdDc6aSW-tCxHXc3Dttt:APA91bHTZjYyar3qTSCET9sGfTFyNJvTrPaLWm2h362t0hSISNZ7iPxZjaruRaKdgTMs4WFlXJcI5U0EwGgzNEWnhi-3ahnHoj2VadH8_v0zvUoX2Kn8TQU	web	2026-05-10 09:42:43.767908	2026-05-16 13:13:10.004642
50	176033e8-b3ae-4a69-ae7b-65070790a480	fbYMys-JT3-dNMPva82LZ4:APA91bHhzHQgZTvRon4Bv-GszxidNO52PBxToMX0INh5frN1QojohH2jxz2G0iDeFFUV_j24uEz__Vfrj8xaIVw16KQh6eGFU_tKGtPEo_DuNPYQtJZKV5s	web	2026-05-11 11:45:49.723047	2026-05-11 14:19:31.942436
43	7a3f6c05-24ce-4b4e-975c-d70e7867d818	czdFQWHlTiyQNLfwKW7pYE:APA91bHoCl3t-at2EBkRvprSfC1N3Xx6J23qf5uGOn4to5pymrlZPUAIT5MPy0defpPpph6T9eoVXJVVjtOdgGmOsJW53L0hNmfJQ0R4eujHXJVhuMDicsg	web	2026-05-11 06:31:15.551127	2026-05-11 06:45:14.316421
86	a44fc361-91c7-4c47-b215-4dd528ca71d1	fdIWbduOSiOyi_zil7X6B3:APA91bHkDmilbo6m_sQ-wW-jJAhpWtq2OyqnJnsWTfRlu_7QblU75el97OQRhoHIGGyh-VwkMdTxtk5wC9sy76b3s8wkyyJYeMv5ZgfNHepcGUPkZXRr7UQ	web	2026-05-15 07:49:59.208822	2026-05-19 15:01:00.125722
51	2c575cfe-fdb1-4252-8b4a-dc44685b014c	dFZRTxYyTMyocjNaGkLCg1:APA91bGDKJ9FVVELrq7MrT4HLufEslEKrmRURheZCXHEhrF_LFpAACTYTACunf5dt5GV3txORHDCcOu6PBCWK3RJoKez7pQzqYg2-jqfpD-OEm9NOlqvve4	web	2026-05-11 12:08:29.783987	2026-05-11 12:08:29.783987
109	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	d1C6pKLlS_qBpDb8rsIGrp:APA91bGWk4fVfmgZdgw2wiT8WCDF1uanPh_Uvv_dFzP61-qXy7RMKD5mPJGo6z0Yls8Ue00qVjT-0Y8r5x9jJj13DP2cCGxIEW06T-RK8crmMWyepLRgSLs	web	2026-05-19 14:42:04.6764	2026-05-19 15:41:36.332306
14	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	eZi0-qoSR9CRmrpyYzDcMM:APA91bHC5W31uomAs6dDh3hcFnnlyDKhm6hQ1w0h0P3ZUmyXphf82nIhTcxakiMFakNdkSFIP2MjYUVwaH8z6A2E807GtPBoFTxGc-TVQeeSwKVOuXdasxU	web	2026-05-09 11:57:04.32223	2026-05-09 13:46:01.003666
13	fefee755-45b5-4cc1-b870-60c6ca2d99a5	cuankcgJSKW0ixlJEhnOrr:APA91bER83v4hGgxGBYJygaRZvZo6g4qSjhMS_0lDqmvjUAezQdxMvbgRZNwzuzGdJOhQEsZqhzcw1GKUYf3EGCN_PPuPIh2yFRIqMC6bmEPrMcs8TzZRek	web	2026-05-08 15:22:55.345548	2026-05-12 14:30:00.319172
80	a3deaca4-2c97-410b-957e-7f1e555e41fa	dLqzyWqqQZWtJ3drG_VGxt:APA91bEcRppo5o3pX1bApT51dbxkk06VHIK3mntWvCkxG1h-v9ZIVHq5FfpPp7H8Pto99JFNEw3AVbspZtP_qliVQlKC1dSMhSRhzBautAm8ebFP_xH5jMs	web	2026-05-13 08:14:57.902615	2026-05-13 08:14:57.902615
30	ec34bde8-4031-448c-867d-fdec468b7f7d	flESZYOZSFyepRyiS3ty57:APA91bEFdDZJv3_xuAie-aTM1BQ3hvpxFLT-EAWoYNLBbkFPzLOGs1Wip8dtD2RrvZieMciFm-jq3WSuUWEtw6osr0y-PFNJiyC5vcfkglQqvR0tLQnVI_I	web	2026-05-09 13:29:15.043881	2026-05-13 18:20:59.063901
48	c5c33302-4369-49ae-bc34-b4aa65def5a1	emPwD2bnTz6AuwWkAQcO_6:APA91bFY-GfQMn-yOT98pIMyKX6Qder7o_cB7uHbyVafvar6BU8UYFRWdYvVLIgeQUICTzbjLccYTNeHPiyUvPBR7TDZcpv0ZYfSvq6XMC5dbJndCX3yQiw	web	2026-05-11 11:34:39.92517	2026-05-14 16:43:02.845219
87	20e3d541-f336-4e5c-b959-d3c80a5d6325	fTBl1eMTSRm_FXkfnoiB9E:APA91bGIz8fj6DVpZoWx1RTmzvo12rf5LyYHyPZNhpGsZxlomitKqcD8zpS5ndMukaOsmUuO5ZLK0stqEai9kuKnD_QUbmEayAfqDW8qMWBnKy0yMpmBDaI	web	2026-05-15 08:15:16.308344	2026-05-15 08:15:16.308344
98	8c5fd867-b035-4eb1-bb71-54e661861dfd	eAEo566jRdSouM_yMHEJ75:APA91bEl4ap-pMVUKCyBaELUl4syLbPtg9uQuVOKFQ0rKOhUijS5DWZa-hdQ-1K-RDUlidRM4vEAgQ1DcI1gri2_9qvzzwss2-301UTvWV0Hp47EW_nAGcU	web	2026-05-18 16:21:37.026513	2026-05-20 06:03:04.793239
84	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	dGiNpEgiQoWF7S2mEEuDdA:APA91bEhJ4FJBWn2I45_2dcxD2a-sIeFabW-J-hfrOCQ8GunJmFEGXcfqBqI5FBdhK801Ekz59WITJvjOU5h5WoiMEk7VciwZigi8vFVz3Gug2sk566nu-U	web	2026-05-15 06:26:59.49714	2026-05-20 15:29:09.738926
3	7a866a5b-e250-4c17-93eb-16b1b1ac090d	dbDSb7rCT1KYJ9vM8oNsCQ:APA91bHLhL-soe6cmsQeVXIfcEp6FgUj0Jr0UaIGEowasVXuPHVagHfVz5Nwxc-j44ELd2xybwAIHcRFqlnPpQR-78H67WQ2kOkPkoitBg4hJjK4DvSSJ_s	web	2026-05-08 11:44:25.622109	2026-05-21 06:07:14.498607
\.


--
-- Data for Name: followers; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.followers (id, follower_id, following_id, created_at) FROM stdin;
eeabccb8-0fc1-4657-b955-166b8867c159	fefee755-45b5-4cc1-b870-60c6ca2d99a5	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	2026-05-09 12:14:52.346566+00
8b6e521f-8192-4161-881c-6eaff8396fb4	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	fefee755-45b5-4cc1-b870-60c6ca2d99a5	2026-05-09 12:15:44.604043+00
6c54565d-3278-45c3-a200-1e1d415799d5	f11b0807-16f0-46a8-894a-075fa92a1204	7a866a5b-e250-4c17-93eb-16b1b1ac090d	2026-05-10 14:04:45.758048+00
d793b621-349a-460d-ade7-13b7a0eb8248	7a866a5b-e250-4c17-93eb-16b1b1ac090d	f11b0807-16f0-46a8-894a-075fa92a1204	2026-05-12 14:18:20.713229+00
fcecb866-a0d0-4380-ba4e-5dd1c9865481	a44fc361-91c7-4c47-b215-4dd528ca71d1	20e3d541-f336-4e5c-b959-d3c80a5d6325	2026-05-15 08:56:52.150973+00
c839afbc-4891-4cb9-9d49-8127539092a1	8748e7ec-fe14-49d2-97ad-418da6bacebf	7a866a5b-e250-4c17-93eb-16b1b1ac090d	2026-05-18 15:55:26.099688+00
0525f0bf-25a7-453c-9550-d9b2adcab38c	8748e7ec-fe14-49d2-97ad-418da6bacebf	8c5fd867-b035-4eb1-bb71-54e661861dfd	2026-05-18 16:30:19.621003+00
c7638963-2806-4a66-aa48-cc1839697f81	8c5fd867-b035-4eb1-bb71-54e661861dfd	8748e7ec-fe14-49d2-97ad-418da6bacebf	2026-05-18 16:30:22.730673+00
3308a3f6-0338-47b3-ac55-acd69fbf3228	a44fc361-91c7-4c47-b215-4dd528ca71d1	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	2026-05-19 07:30:05.201899+00
441783b5-cbac-4ab3-a47b-6ac49453cdb6	a44fc361-91c7-4c47-b215-4dd528ca71d1	573ac182-4ab9-4ad7-bd6e-5b15437d7066	2026-05-19 07:30:13.036494+00
6766a030-4376-4f84-8d5a-4e854a155109	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	a44fc361-91c7-4c47-b215-4dd528ca71d1	2026-05-19 14:42:34.173745+00
79470b25-f01f-46f4-ac89-fd945a423dbd	20e3d541-f336-4e5c-b959-d3c80a5d6325	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	2026-05-19 17:47:27.528203+00
bb60ca12-3703-40b8-97e5-c5b66bb84570	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	2026-05-20 05:34:22.718063+00
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.messages (id, chat_id, sender_id, message_type, content, file_url, created_at, waveform, local_id, music, status, replying_to, seq, quiz, duration) FROM stdin;
a29360c1-9dc7-428a-aaf8-3b8f83e53688	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Hii	\N	2026-05-09 12:16:02.364596+00	\N	c5241747-4839-40c8-8357-fad0e142f3ce	\N	sent	\N	1	\N	\N
c860bc3d-f2ec-44f7-aaf8-219c11c45c21	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Hellooo	\N	2026-05-09 12:16:08.893186+00	\N	3c94dbd6-975b-4e8a-965c-7644a191f026	\N	sent	\N	2	\N	\N
7cc47ab1-5e9a-4e3d-9994-484625f2c56d	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Yeh tumhare chat pe jake chat button pe tap kar rha toh chat nahi khul rha	\N	2026-05-09 12:16:20.800075+00	\N	36301829-523b-42b1-a0dc-ea472ced3e8d	\N	sent	\N	3	\N	\N
9f2429a8-3b0d-4950-a4e8-50e96a3e7464	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	And tetris game me woh cheez abhi tak theek nahi kiya	\N	2026-05-09 12:16:31.097176+00	\N	067dd2f1-9f8f-4418-9ab0-abf8d3fc946d	\N	sent	\N	4	\N	\N
cfcd36cd-6fdb-4fc4-b5db-c7f080eae977	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Han	\N	2026-05-09 12:16:36.959873+00	\N	f711f856-2896-4649-9da3-d0ec05c42551	\N	sent	\N	5	\N	\N
b3ae4aad-4f76-415a-8e9c-2ff6dbe4dd71	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Late response	\N	2026-05-09 12:16:38.173339+00	\N	d76a3d07-a57a-408e-8aaa-89cd3a53c15e	\N	sent	\N	6	\N	\N
982f5003-7839-4021-ba3c-b52bec3250ea	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Vo hata ne pade , 4-5 games	\N	2026-05-09 12:16:42.411724+00	\N	91bf313d-b3bb-4446-99db-c11af6ac6dc4	\N	sent	\N	7	\N	\N
6990b48f-06a8-4cab-bb60-bc3792bf5342	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	And aall	\N	2026-05-09 12:16:45.070179+00	\N	848b1fdc-8b94-499c-aef4-5e8a28ef649f	\N	sent	\N	8	\N	\N
04f38d51-0829-4704-80fc-2e6f5d98773a	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	And neeche sweep karne wala bhi nahi daala ki neeche sweep kare toh ek baar me beth jata hai like other tetris games	\N	2026-05-09 12:17:07.385397+00	\N	f68ee408-a4a4-4531-b257-7854d5d6b6c7	\N	sent	\N	9	\N	\N
80fa7d92-2c86-4622-9c6c-a161b4a24bd5	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Let me try other ones	\N	2026-05-09 12:17:17.559899+00	\N	9efb218a-f6c5-4dbd-9413-b6d83c562e35	\N	sent	\N	10	\N	\N
9fcc317b-13f9-4ce8-b22c-7c50a0358356	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Quiz me abhi bhi wahi hai cricket tap Karu toh football ke questions	\N	2026-05-09 12:17:47.507368+00	\N	12af5742-d7f8-4f16-9585-9c09f21a2262	\N	sent	\N	11	\N	\N
7a05366c-5353-4135-ba0e-fc537cc9aa91	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Han han	\N	2026-05-09 12:18:51.025561+00	\N	a7596fee-fad1-4dea-bc4b-1e516417427e	\N	sent	\N	12	\N	\N
6ea2c8c4-1a23-4ede-bd84-b7270f6877b2	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Han , vo quiz	\N	2026-05-09 12:18:53.693921+00	\N	d4486d53-321f-4230-bbbf-f2a9e0eba3e4	\N	sent	\N	13	\N	\N
02301c2c-e59d-4e25-9d35-b1b5690336f7	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Ai se connect hojayega	\N	2026-05-09 12:18:56.674479+00	\N	456673cb-0001-464b-ad93-7a94760b2afc	\N	sent	\N	14	\N	\N
3e1082f7-effe-4bcb-a1ff-f618dd6d2aa2	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	And bhai tu yaha chat oe reh	\N	2026-05-09 12:19:02.641058+00	\N	fc107c02-0992-4ec2-a9c8-1fd3f1e288db	\N	sent	\N	15	\N	\N
c633a52a-322c-4dd0-b0f4-ebd448091f68	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Reply asap	\N	2026-05-09 12:19:04.551738+00	\N	9f1d60b0-8e37-4d9f-9a7e-33c63f538364	\N	sent	\N	16	\N	\N
0cfd2094-5158-4d09-a7bd-5a908483d50f	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Number game bhi same hai validate tap kar rha toh green hojata but change nahi hota Baar baar reset button pe tap karna padta jo utne upar rakha pada hai	\N	2026-05-09 12:19:16.149881+00	\N	0561cedd-bacc-4ca6-b023-3615dc2bad66	\N	sent	\N	17	\N	\N
54bdf8dc-8833-4761-b486-58dd8ac97e6f	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Idhar hi hu	\N	2026-05-09 12:19:26.469074+00	\N	a346d22a-3f97-4825-8810-852eedfd896c	\N	sent	c633a52a-322c-4dd0-b0f4-ebd448091f68	18	\N	\N
e1a53068-87c0-499f-bdc6-6415c0ac2070	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Han uska thoda logic kuch ending badalna padega	\N	2026-05-09 12:19:41.978243+00	\N	b9372e95-d859-4ba5-990e-2da638c03d1c	\N	sent	\N	19	\N	\N
f8245ae7-6fea-409d-a861-5f9a9e163c93	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	And msg me sweep krne pe reply hota hai woh krdo please 😭😭😭😭	\N	2026-05-09 12:19:42.779464+00	\N	2767f2dc-a77f-4b12-bf12-e73960e1935c	\N	sent	\N	20	\N	\N
0733d4ae-de8e-47f4-a4e1-18568a1443ce	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Aur try krne do	\N	2026-05-09 12:20:07.149745+00	\N	98a2b378-38ff-49c2-be76-87d86425057f	\N	sent	\N	21	\N	\N
c8267502-5922-4306-9939-25b6b95f06f4	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Bolt shu ruk	\N	2026-05-09 12:20:15.106069+00	\N	0cdd4c64-cee0-45d3-8dd6-0ad7b85057b0	\N	sent	\N	22	\N	\N
54d3efec-29a7-464a-975d-c502f967dbb9	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778329233792-1778329233786-0.3142614574412539.jpg	2026-05-09 12:20:33.910066+00	\N	7e4d2c09-07ad-4165-8262-bf08d7d4fe41	\N	sent	\N	23	\N	\N
a1097652-9795-4caa-a98a-e115880a53f3	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Word competition pe hint ka option do bhot unexpected words de rha	\N	2026-05-09 12:21:41.632705+00	\N	48904e36-1c13-4729-ab28-149df0b22830	\N	sent	\N	24	\N	\N
ce3336c7-892b-45e6-ac82-3cd0e41d6632	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Ball sort me abhi bhi same problem	\N	2026-05-09 12:22:14.458117+00	\N	042dcce2-274d-4243-8b44-25793a7783c0	\N	sent	\N	25	\N	\N
ce01b337-a35d-4bcf-9ba2-109bc5c77ac7	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Jo top colour hota hai woh jata hai jaha pe choose kare	\N	2026-05-09 12:22:29.870729+00	\N	4d9dec52-1c84-4534-8305-5ef9ae0fb938	\N	sent	\N	26	\N	\N
71858447-f4f9-4a7c-adb3-e88f0881098a	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Kuch bhi random nikal ke chale ja rha	\N	2026-05-09 12:22:35.883608+00	\N	83ff331b-cc6e-4cc9-9969-e32a14f59f4f	\N	sent	\N	27	\N	\N
80cbafac-dfb1-40cf-9a0f-28de0b85e01c	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Erod completion easy to moderate se start karvayege	\N	2026-05-09 12:23:23.54266+00	\N	4c9ae9d1-f82d-4660-9614-72dd422e121b	\N	sent	\N	28	\N	\N
8d6238f3-3afd-4215-a6c0-ba04c1df10aa	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	sticker	\N	https://static.klipy.com/ii/ffd4ac143e6335ac68951b787d3c1902/b8/59/n5LJZhER.webp	2026-05-09 12:23:40.440779+00	\N	fd724ec1-dc9a-4dec-81cc-6852fbe10d29	\N	sent	\N	29	{}	\N
f364b461-99fb-42dd-832f-356445135cf7	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	audio	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778329425095-1778329425093-0.4976857471971643.aac	2026-05-09 12:23:45.164292+00	{0,0,0,0,0.9099511,0.9099511,0.924064,0.924064,0.9556027,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}	37f3548a-18b6-4d29-a7be-013d839e4ab4	\N	sent	\N	30	\N	1041
c87cf06b-ed96-4329-b472-e7fb1f0d52cc	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	audio	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778329428547-1778329428546-0.2922702929063048.aac	2026-05-09 12:23:48.583056+00	{0.9250547,0.9250547,0.950749,0.950749,0.95770836,0.95770836,0.96284795,0.96284795,0.99384916,0.99384916,0.9938992,0.9938992,0.99377114,0.99377114,0.99338514,0.99338514,0.969895,0.969895,0.9879699,0.9879699,0.9935608,0.9935608,0.98196316,0.98196316,0.97678584}	8e2dd89a-c27d-4ff1-9378-f28d174503eb	\N	sent	\N	31	\N	2482
4e4871e7-1703-4055-80e3-5fac713d2c53	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	audio	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778329433736-1778329433734-0.2693376664724827.aac	2026-05-09 12:23:53.777819+00	{0.9938046,0.9938918,0.9938918,0.9936223,0.9936223,0.96425825,0.96425825,0.9311971,0.9311971,0.9938992,0.9938992,0.9937693,0.9937693,0.9938992,0.9938992,0.98466194,0.98466194,0.9939011,0.9939011,0.99388623,0.99388623,0.9939029,0.9939029,0.9931563,0.9931563}	50288e8b-ad3a-45e3-9073-6784ccd2f953	\N	sent	\N	32	\N	4333
5befbc8b-d067-44a2-a96b-108c3593fa75	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778329446618-1778329446615-0.7379500678152968.jpg	2026-05-09 12:24:06.726442+00	\N	a03e30b0-ef16-4ff5-a3ed-9821486cd5d3	\N	sent	\N	33	\N	\N
28875a12-36f4-45c5-a5dd-b06af16d4585	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Isme pura gesture based aajayega	\N	2026-05-09 12:24:23.400461+00	\N	c99d5aff-73dc-423e-88df-084627a640a4	\N	sent	\N	34	\N	\N
882d858f-f17f-415a-b1b5-faaf675a090a	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Audio toh theek time stamp 0:00 hi dikha rha	\N	2026-05-09 12:24:37.155746+00	\N	3e6ac303-21f8-47f2-838e-2870afa5060d	\N	sent	c87cf06b-ed96-4329-b472-e7fb1f0d52cc	35	\N	\N
96e0ca2f-68a4-4f90-80ae-73b49a132907	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Isme notification me tumhara msg kyu nahi dikha rha	\N	2026-05-09 12:24:53.871167+00	\N	4cc46790-0649-41ae-8f30-a16ab53b50ce	\N	sent	5befbc8b-d067-44a2-a96b-108c3593fa75	36	\N	\N
39a00478-f093-429f-85af-5e05eb20d949	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Yeh bhi badhiya hai mene ss notification ke liye bheja tha but msg nahi gya idk why	\N	2026-05-09 12:25:13.874415+00	\N	5938fc7b-03e9-41d6-bc20-0bb726fe885c	\N	sent	28875a12-36f4-45c5-a5dd-b06af16d4585	37	\N	\N
facd7db5-2b1e-400b-bed1-c15ec020447c	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Han vo bolta hu ruk	\N	2026-05-09 12:25:16.839504+00	\N	5361fbfb-8b28-4637-b8a0-ead700d35969	\N	sent	\N	38	\N	\N
295d56a4-0064-4062-b49b-5d06a9531a1a	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Photo expand karne ka option do download wagera krne ka	\N	2026-05-09 12:25:44.318831+00	\N	c2f3d681-2df5-4460-9015-70d8c9f32617	\N	sent	\N	39	\N	\N
ee26fde4-396f-4904-b8ba-a6ed66bc02bc	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Like insta	\N	2026-05-09 12:25:50.507833+00	\N	d4549d3f-22f5-4ab2-8570-0ff2b4114a9b	\N	sent	\N	40	\N	\N
d91d86d0-46f0-4745-8f09-837031ca485f	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Nd whatsapp	\N	2026-05-09 12:25:55.64539+00	\N	1ebafe2f-6fd3-4848-85b6-e4befa80ff86	\N	sent	\N	41	\N	\N
476d9d03-c3e7-48e6-8667-673c709dbdd2	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Mere me to tera name hi nahi dikh raha sala	\N	2026-05-09 12:26:00.185588+00	\N	1fb869d0-4259-4cd5-9d71-289e8a3900dd	\N	sent	\N	42	\N	\N
353bcd09-cbe3-4822-9577-14d7440ec002	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	In chat box	\N	2026-05-09 12:26:03.654089+00	\N	8cd58e56-32b1-49fd-b436-9e06adf0e415	\N	sent	\N	43	\N	\N
3d7e3d64-0b9b-4528-bc24-fbc58fb035e6	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Notification me jo aata he usme reply kare jaraha hu	\N	2026-05-09 12:26:12.17113+00	\N	f5dbba96-01d5-4c29-aeb8-fc16ebb48446	\N	sent	\N	44	\N	\N
81349490-3718-46a3-9e4c-b57da94281b2	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Tuje meri vibe match request accept Kari !	\N	2026-05-09 12:26:18.405237+00	\N	f0b73475-f3ea-448e-8f8c-77e5fb0caaab	\N	sent	\N	45	\N	\N
c9f6ad08-bee6-4503-bff0-2b0f2e34636f	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Teri story me mene 5 point diye aagaye dekhna	\N	2026-05-09 12:27:36.215067+00	\N	bc720f8a-cbde-403c-80b2-13c49f83a96b	\N	sent	\N	46	\N	\N
68cd9a62-e038-4fff-bf31-c7693eb62a39	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778329697208-1778329697203-0.9858259387940493.jpg	2026-05-09 12:28:17.274236+00	\N	20902df8-9a18-4218-80c7-fb7be3b6aebe	\N	sent	\N	47	\N	\N
d1a72af3-00e4-4ced-852c-efa8c83b239e	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778329716733-1778329716730-0.08174266965282828.jpg	2026-05-09 12:28:36.826344+00	\N	a8a0f354-91e7-4415-a9bf-e8f416433712	\N	sent	\N	48	\N	\N
67040da3-ab0c-414c-8ce9-482ad441b984	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778329737027-1778329737025-0.7404761132481319.jpg	2026-05-09 12:28:57.131067+00	\N	3b1c7b49-30ca-4812-a20e-ae30966cb639	\N	sent	\N	49	\N	\N
6ebf3e3a-c8db-4012-964c-8c8aaddb0545	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Like ek complete Kiya toh next wala apne aap complete hoke 3rd wale me bhej rha	\N	2026-05-09 12:29:12.734485+00	\N	07c4cc27-6260-4916-896a-68a07e45adf4	\N	sent	\N	50	\N	\N
66dcef90-d1ad-4a39-8bbf-376229f6add5	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Yrr iske koi koi game ke , changes vala code upload nahi hua he iguess	\N	2026-05-09 12:29:31.504527+00	\N	a7870e72-4ffe-480e-ac72-06ed77f1278b	\N	sent	\N	51	\N	\N
19426190-57c0-4a6f-abc5-fadbca9b95bf	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Wtf mene teeno ss ke saath msgs bheje the kaha gayab hogye?	\N	2026-05-09 12:29:37.000632+00	\N	75bf70f7-17f1-4fcd-9515-759d8f565d11	\N	sent	\N	52	\N	\N
e1c7ac09-e5cb-4982-9df9-1e986fcca55f	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Wapis likhta hu , yeh kaha ka easy hai peechle version me jada easy de rhe the	\N	2026-05-09 12:30:16.650064+00	\N	55b2deb7-6fc1-4bf6-843e-e730ef321fb6	\N	sent	d1a72af3-00e4-4ced-852c-efa8c83b239e	53	\N	\N
a326d15e-cc69-41af-8b44-6c50769eb9da	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Yes yess	\N	2026-05-09 12:30:29.864379+00	\N	64a6b4cf-f1fb-4c43-9fa2-13180fe5e786	\N	sent	\N	54	\N	\N
a016a820-eb50-42f3-9d51-16f4a860ba70	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Vo upgraded tha	\N	2026-05-09 12:30:32.939402+00	\N	af6d32f2-9011-4b80-8f52-986712362111	\N	sent	\N	55	\N	\N
e6a60085-c8a5-47fe-9ed7-ea552b778b33	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Vo code base nahi add hua he	\N	2026-05-09 12:30:36.717261+00	\N	0e5cf535-697a-4dee-aa91-7c1bf838bf63	\N	sent	\N	56	\N	\N
3b473a2e-aa79-4ef2-8d50-85e51d10ffe5	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Yeh jese hi complete hua and next mara toh blue wala apne aap complete dikhane lag gya and third green wale me bhej diya	\N	2026-05-09 12:30:44.07884+00	\N	688dee34-f6cd-4090-8a67-76d85b5f2c7e	\N	sent	67040da3-ab0c-414c-8ce9-482ad441b984	57	\N	\N
8c435349-6f84-4a0c-9a6e-616e617217e5	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Yeh toh most critical theek karo bhai msgs gayab ho rhe	\N	2026-05-09 12:31:06.67055+00	\N	2635cf7b-38ee-4129-bdab-83b6d07a305d	\N	sent	19426190-57c0-4a6f-abc5-fadbca9b95bf	58	\N	\N
ac183926-3541-453a-a17a-0d4f91c92e7b	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Backend me bhot issues hai tumhare	\N	2026-05-09 12:32:57.707662+00	\N	7939bbbe-719b-44cc-a549-0b6dbaa3e2f2	\N	sent	\N	59	\N	\N
37f44668-8320-4be7-a3fa-e69821f43f82	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Are bhai sahab	\N	2026-05-09 12:33:17.070185+00	\N	4405af89-54f6-4e4d-875d-4cef8370f818	\N	sent	\N	60	\N	\N
64dd3645-f18b-4ec6-a94d-19463cc1f0e0	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Msg i guess delay ho rha hai	\N	2026-05-09 12:33:38.592307+00	\N	8a37fb0c-c4de-4ced-8ad5-aef6e3499cc4	\N	sent	\N	61	\N	\N
dda04f0c-1f30-4b3a-9cce-58ab4373d072	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	3-4min ka	\N	2026-05-09 12:33:43.981875+00	\N	d74cc3e5-9d89-4963-8b7b-2de1ce5ad756	\N	sent	\N	62	\N	\N
500f95cd-6a10-4089-9a7c-1118f417e891	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Nah nah	\N	2026-05-09 12:33:50.941489+00	\N	33dbf7f3-4d02-43a6-831d-56d91dc5ea18	\N	sent	\N	63	\N	\N
74e95db5-48e8-4a4d-8121-67a5c2c2b127	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Mene late dekha	\N	2026-05-09 12:33:54.926164+00	\N	34c380cf-1d64-487d-8a7b-c2d7d097def1	\N	sent	\N	64	\N	\N
56f54d03-c971-41e1-8ec3-938a6ef15fcb	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Msg to iguess shi chal rahe he I am sending ag ,6:04	\N	2026-05-09 12:34:08.344239+00	\N	110c4b2e-c7ce-43e1-899c-4b8876cd9a2c	\N	sent	\N	65	\N	\N
5c7c4249-330e-416d-9459-0b9d002168a4	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Accha toh theek	\N	2026-05-09 12:34:09.389219+00	\N	1c2d7e37-6eb1-4549-b6e7-3f2e9319edbd	\N	sent	\N	66	\N	\N
326da60e-39c5-4fec-93aa-d1ab59765188	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Ha sahi h	\N	2026-05-09 12:34:17.702922+00	\N	ff5e25c2-baf4-45a4-9e1f-e2aac18a6366	\N	sent	\N	67	\N	\N
6f11c71d-129e-4930-8ecd-b93bbc7c730f	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	No delay	\N	2026-05-09 12:34:21.322809+00	\N	d8b2daf8-27fb-4ec4-8b06-5a93413700e3	\N	sent	\N	68	\N	\N
0486c94e-1e92-4729-8000-85bfa00ca63b	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Yes	\N	2026-05-09 12:34:22.158585+00	\N	067bad09-d02f-43b2-bfee-1a34e776d0f4	\N	sent	\N	69	\N	\N
68551147-2293-4bfe-b8e4-fb26665ec075	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Baki msg ka UI sahi karna he	\N	2026-05-09 12:34:29.321013+00	\N	d32aa83e-3c8a-4cbc-a647-e298e8f4bc00	\N	sent	\N	70	\N	\N
e2eada66-57cc-4ac7-9b4e-0fe2c8df1f2b	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	music	\N	\N	2026-05-09 12:34:36.594165+00	\N	4fa57dfd-ac06-4329-ac83-9d4c651063b6	{"id": 1889992113, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1d/1b/f9/1d1bf9b1-44c6-9a6c-6ffb-c158488c06ce/26UMGIM39303.rgb.jpg/300x300bb.jpg", "title": "drop dead", "artist": "Olivia Rodrigo", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/f9/18/9c/f9189c09-aace-62f8-1251-89cca8d2cd79/mzaf_2040929130350027796.plus.aac.p.m4a"}	sent	\N	71	\N	\N
d12ed10b-d110-4715-923d-0d917c103c2e	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Bhot jada need hai us cheez ki	\N	2026-05-09 12:34:39.669818+00	\N	8940ca9b-be0c-456d-b00b-c731b47d6afd	\N	sent	\N	72	\N	\N
41ad5221-f7b7-43b3-82b2-c080f3c37426	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	And bc msgs hi gayab hoja rhe	\N	2026-05-09 12:34:47.268206+00	\N	97391ea4-0379-4dae-90de-9296bac5266b	\N	sent	\N	73	\N	\N
132292b0-e06b-4c24-957c-bfc516520a1c	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Ek photo se jada bhej nahi paa rha	\N	2026-05-09 12:34:53.716178+00	\N	9c5811ac-e799-4f11-bb26-f4676513b0c7	\N	sent	\N	74	\N	\N
fedf2ee4-3ef3-4d44-bd28-dda928bb531f	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Han han	\N	2026-05-09 12:34:59.164416+00	\N	b3cf2269-8f3c-46c0-9bc5-373df0958c8b	\N	sent	\N	75	\N	\N
aaa13fb1-8284-47e8-92d3-565e04d0f913	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Notification dikhaye ja rhe even after checking the msg	\N	2026-05-09 12:35:03.903112+00	\N	fedd4fde-f8a5-4e7b-a69f-e010f9fbeaa6	\N	sent	\N	76	\N	\N
1cabfb4a-c0b7-4445-af6d-86ac710f8ff5	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778330108398-1778330108392-0.34807607235114024.jpg	2026-05-09 12:35:08.527406+00	\N	0c278b2e-0596-4a61-976a-ad551d71daa3	\N	sent	\N	77	\N	\N
ad546960-d0b6-4f97-b605-fa9dd6d9fea6	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Ye log itne bade event ki ppt bhi claude se banva rahe he 😭	\N	2026-05-09 12:35:21.950622+00	\N	995c5b23-f362-4854-8edc-8debaac53529	\N	sent	\N	78	\N	\N
3aebfdcb-5743-4a7e-bb20-9bdc02f2f0c5	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	See I can't check the photo smjh nahi aa rha	\N	2026-05-09 12:35:31.090476+00	\N	758e3faf-79ca-4313-bc05-6af9177f02fd	\N	sent	\N	79	\N	\N
7de54f5e-980b-49d9-837c-4c2c070b00e8	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778330396388-1778330396377-0.3835728838028021.jpg	2026-05-09 12:39:56.478009+00	\N	d70382e2-5c44-4a6f-9d66-d2bf4a4a7f73	\N	sent	\N	80	\N	\N
587f7756-9ba5-4c0c-9214-051b44285fcd	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Pehle 108 tha kam kese hua	\N	2026-05-09 12:40:02.242715+00	\N	2c3b41d6-5239-4a0c-8a77-6148286ca07b	\N	sent	\N	81	\N	\N
0063c391-161e-42f2-9b60-855c83fd0351	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	WAPIS MSG GAYAB BC	\N	2026-05-09 12:40:09.005169+00	\N	72425195-3716-4ac6-bab9-964e1b4797ab	\N	sent	\N	82	\N	\N
33d0a748-d3a2-4b6c-b9c7-669497d8a41b	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Yeh centre me 103 kya hai , pehle 108 tha kam kese hogya	\N	2026-05-09 12:40:26.920137+00	\N	c3120308-630c-49a8-9b42-3da45a5fec6b	\N	sent	7de54f5e-980b-49d9-837c-4c2c070b00e8	83	\N	\N
e2d46fdf-8404-4a50-a476-edf97dabd016	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Kaha	\N	2026-05-09 12:40:49.285596+00	\N	4c573c2b-65ac-40af-bee3-0975befac11d	\N	sent	\N	84	\N	\N
dfaed30f-65f1-495f-af63-c47a1ef8f09c	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Achha vo	\N	2026-05-09 12:40:59.565715+00	\N	ce368044-be2f-4eb4-9005-74391166a199	\N	sent	\N	85	\N	\N
f6f8eef8-3755-45f9-b71c-9e02cfcfeee9	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Point to nahi he kya he vo 💀	\N	2026-05-09 12:41:06.469767+00	\N	a2e4fffb-86f1-4cef-a820-0b6c537a5771	\N	sent	\N	86	\N	\N
b4747576-6209-4b4c-abd9-5e303bdade04	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778330506415-1778330506407-0.3501674530824077.jpg	2026-05-09 12:41:46.489934+00	\N	f54d4d10-62d7-4165-bffc-390ddc87827a	\N	sent	\N	87	\N	\N
6c8da5b6-706f-41ee-ae49-34144f271612	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	image	\N	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/messages/1778330511825-1778330511821-0.36986275149613324.jpg	2026-05-09 12:41:51.872992+00	\N	f485269f-f5a2-4b0e-85be-88b5492ccd76	\N	sent	\N	88	\N	\N
d5980b47-3e77-4a74-b9c6-6dc66f14e454	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Delay hai msg and notification me	\N	2026-05-09 12:41:59.343312+00	\N	ce691480-65ea-49bd-a16d-4178cb44f0c5	\N	sent	\N	89	\N	\N
bd4d83da-171a-466e-8dcd-e853fb035e84	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Achha	\N	2026-05-09 12:42:04.782627+00	\N	6ff92040-42e5-4c45-9ce5-5dbd562e4c60	\N	sent	\N	90	\N	\N
0281294a-33d4-4814-9717-ebd842a5800e	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Ab message aya	\N	2026-05-09 12:42:05.45536+00	\N	818f9625-af95-43d5-8e7d-d6d6f85727d3	\N	sent	\N	91	\N	\N
88c72f9c-98bb-4e99-9e19-e6cb1117b174	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	18 issues bata diye 💔	\N	2026-05-09 12:42:19.785209+00	\N	2f8423f7-5209-4053-a3c0-4ecaa076c437	\N	sent	\N	92	\N	\N
3da919aa-1f4e-4a56-9d99-770071271937	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	Abhi check kat or achhe se issue nikkelege and issue whatsapp pe bhejde ya ek doc create kardena fas fas	\N	2026-05-09 12:42:57.811888+00	\N	4416d1c3-74de-4070-a839-a12c95c00ddb	\N	sent	\N	93	\N	\N
99704e00-fc60-4db0-94c7-16367ed96e08	1521f55b-040c-4d78-b615-2ca50766db98	fefee755-45b5-4cc1-b870-60c6ca2d99a5	text	To team ko bhej deta hu	\N	2026-05-09 12:43:01.446697+00	\N	f1852f97-d17d-4683-b6e3-defa22519332	\N	sent	\N	94	\N	\N
c1ea0df5-c303-478f-95b4-ffcae8961661	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Okk	\N	2026-05-09 12:43:09.962578+00	\N	e5382a9e-6f00-4030-8b0d-abf6f74c9549	\N	sent	\N	95	\N	\N
50980f7b-7565-4bbb-9dae-b38d3074b050	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	Karta	\N	2026-05-09 12:43:12.147739+00	\N	cfb655bc-62f3-4460-970e-243e729b795e	\N	sent	\N	96	\N	\N
b864a89f-ef43-4b01-b240-317c783cb65e	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	.	\N	2026-05-10 18:42:12.925128+00	\N	f3ee08b3-9dd5-4fdd-a389-a1a8d6984c6b	\N	sent	99704e00-fc60-4db0-94c7-16367ed96e08	97	\N	\N
6c12e9b5-8b78-442b-9d05-662f52e18c52	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	.	\N	2026-05-10 18:42:23.013043+00	\N	2850ab36-8894-4331-9278-e41d92a27556	\N	sent	e2d46fdf-8404-4a50-a476-edf97dabd016	98	\N	\N
56785bd3-770a-4e15-a232-7b4e2bd8b06a	1521f55b-040c-4d78-b615-2ca50766db98	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	text	.	\N	2026-05-10 19:39:05.403747+00	\N	b4c9f4c3-34fd-44f3-9540-c633c5760dd8	\N	sent	\N	99	\N	\N
836b5d2c-31ad-4cc6-a6eb-f27bc5f2daaf	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Oyy	\N	2026-05-18 16:30:36.658591+00	\N	79378bc9-f010-4192-975d-9feaeb4ae79a	\N	sent	\N	1	\N	\N
90432bef-105f-49c7-9d9f-20922f086c03	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Mardchod	\N	2026-05-18 16:30:42.046377+00	\N	0e871eb7-435c-4d2d-b502-5faccef78ea1	\N	sent	\N	2	\N	\N
368e6aab-5bd1-4bd1-b52b-bace13e1c021	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	music	\N	\N	2026-05-18 16:31:36.795367+00	\N	c43fbfc1-8be7-42d2-841b-03b7f19de7e8	{"id": 1428384017, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/22/d2/a0/22d2a059-7a78-baaf-9f8b-5c515aebe086/886447271155.jpg/300x300bb.jpg", "title": "She Move It Like", "artist": "Badshah", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/87/2d/40/872d403e-a68e-0f7d-97ac-271315cebd97/mzaf_6481861710929110727.plus.aac.p.m4a"}	sent	\N	3	\N	\N
78da1152-3ee2-404a-bb07-e7771eb6aafb	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	text	Are bhai sun kal practical dena hai	\N	2026-05-18 16:31:46.842611+00	\N	a08cd094-7989-457a-af87-a0ca238cd536	\N	sent	\N	4	\N	\N
b66adc95-9f65-49c9-8e3f-24621b8896e2	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Haa	\N	2026-05-18 16:31:59.81577+00	\N	bf6f2aeb-cc10-4c3b-88e7-4d7fa1c63940	\N	sent	\N	5	\N	\N
22adc6d5-c8d8-4b33-bf32-2e38816b79ad	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	text	Ayega kya kal college	\N	2026-05-18 16:32:04.65142+00	\N	e35a5d67-7805-4385-9669-f0e9ee231746	\N	sent	\N	6	\N	\N
99bb7156-7695-4b28-8688-057abd697169	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Nope	\N	2026-05-18 16:32:22.114179+00	\N	0c493435-acec-4760-be50-15a9de9b2778	\N	sent	\N	7	\N	\N
9d426a81-a215-4d51-b9e3-fcfc2a947518	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Mein  Jo Mera date hai uspe jaunga	\N	2026-05-18 16:32:52.565396+00	\N	2f7b60e1-61c4-4c21-83d2-6f089bf535e7	\N	sent	\N	8	\N	\N
fe98e11b-eaab-4c6a-9321-022ea3c97ded	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	sticker	\N	https://static.klipy.com/ii/40e5f3c9157feea5d28a6b4ad3880d85/75/0c/5y9ggPeO.webp	2026-05-18 16:33:03.471638+00	\N	adcc9c7f-bf7d-4c47-8f1a-8ea8c6dad46b	\N	sent	\N	9	{}	\N
c4b645e9-5981-40fc-b144-6404f20ced51	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	text	Agreed bro	\N	2026-05-18 16:33:07.92059+00	\N	e2743f45-da30-435e-a69c-b3950eb62339	\N	sent	\N	10	\N	\N
b7f8ff90-2086-46ac-982a-a24b67ac3f5e	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Btw the way  bahut accha clg hai mera	\N	2026-05-18 16:33:17.727217+00	\N	293fac8c-c3ad-4839-95ce-197386788030	\N	sent	\N	11	\N	\N
18dc3e58-0a8b-413c-82a1-9d7d106c2559	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Oy	\N	2026-05-18 16:33:56.015184+00	\N	c596ed80-046c-432d-a06e-580d9deaf16f	\N	sent	\N	12	\N	\N
cba2ea73-9c87-440b-9326-dcf61db86418	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Oy	\N	2026-05-18 16:33:57.209878+00	\N	10ec3286-cba1-49b7-a21a-9a2e8c4af7ea	\N	sent	\N	13	\N	\N
3b7304d5-8ea0-47c2-a95f-72d1cf523781	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Ou	\N	2026-05-18 16:33:59.220658+00	\N	17844f04-8eb2-4c84-a1fd-c54e502e761f	\N	sent	\N	14	\N	\N
8e58a815-0c3e-4fd5-8140-888063a5a7e0	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Ut	\N	2026-05-18 16:34:00.271433+00	\N	3a34e531-938b-4ae9-a16f-44d08b33dfda	\N	sent	\N	15	\N	\N
4efdb0a8-bda8-4544-afe3-5eac3c8dcebe	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Ugg	\N	2026-05-18 16:34:01.227477+00	\N	c4d889eb-e492-4100-bd73-81d5f8ac8e5f	\N	sent	\N	16	\N	\N
31436c95-8e77-45b6-b367-619c244c2bd4	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Gcu	\N	2026-05-18 16:34:02.345202+00	\N	7d015a65-1d19-4e73-90f6-1277c6e7cce7	\N	sent	\N	17	\N	\N
c36e908f-5512-4c77-b4ae-133953beaa55	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	text	Haa b9l	\N	2026-05-18 16:34:06.433039+00	\N	eeb3f259-4fed-4d5c-b668-8b72e1c352ed	\N	sent	\N	18	\N	\N
2d0a677a-17b1-4845-af11-d86601f4a128	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Ok	\N	2026-05-18 16:34:08.193234+00	\N	19c0af3b-d04c-4093-a834-d781def87439	\N	sent	\N	19	\N	\N
5af3ff14-e91b-49f5-8bca-41ecc259a473	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	text	Bol*	\N	2026-05-18 16:34:10.131152+00	\N	ab647197-0f13-4856-90e6-92cab77e5de2	\N	sent	\N	20	\N	\N
4b7aed3b-50eb-451d-aed9-b7659931bfe5	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Heloo	\N	2026-05-18 16:34:10.885106+00	\N	b88c35c8-f4c5-47be-902b-66298c984fb0	\N	sent	\N	21	\N	\N
3b972233-0cc9-441e-8746-2b89fcb36478	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Czxc	\N	2026-05-18 16:34:12.953223+00	\N	1c44c9ec-3520-41e9-a240-b0fc007d84b7	\N	sent	\N	22	\N	\N
c904372b-0ab4-4dc4-9165-7de18cb6316f	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Good	\N	2026-05-18 16:34:16.335116+00	\N	993101c5-7d2c-4ab3-90a1-f01d7180ab8b	\N	sent	\N	23	\N	\N
989d4a71-634d-4916-b532-cb38f5f940a6	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	music	\N	\N	2026-05-18 16:34:36.207064+00	\N	0ddf5207-5e12-4b0e-8197-2fa1860fc311	{"id": 251948354, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/38/8b/7a/388b7a8f-10ff-a4e0-7624-65e29ac6a793/828765374828.jpg/300x300bb.jpg", "title": "Toxic", "artist": "Britney Spears", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ae/c4/7f/aec47f56-842d-49b4-558b-7a7523fd6728/mzaf_6693111381462300599.plus.aac.p.m4a"}	sent	\N	24	\N	\N
9e2f0b75-7eea-408d-a452-dae3e830f97c	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	sticker	\N	https://static.klipy.com/ii/c98c4a4935d23b95805f0befee091d8a/a9/5e/kRvLGkhz.webp	2026-05-18 16:35:36.848934+00	\N	74d4ff9b-13e9-410d-94f1-eb585bc6cdd4	\N	sent	\N	25	{}	\N
8a17dc97-56a5-4827-a289-edc3e50e8e84	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	text	Aaj college ayega kya ??	\N	2026-05-19 03:12:43.923428+00	\N	d08cbfcf-b1cb-487d-b5f8-3f8e27db9079	\N	sent	\N	26	\N	\N
a420083f-b189-4946-bc73-79e26eca4833	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	text	Oye ??	\N	2026-05-19 08:45:56.562212+00	\N	0fc5f42b-28d5-464d-b3b4-1eb07e0d544f	\N	sent	\N	27	\N	\N
d9662250-3f1e-4446-8755-1d42661691b1	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8c5fd867-b035-4eb1-bb71-54e661861dfd	text	Project hoga kya	\N	2026-05-19 08:47:01.316692+00	\N	df8c0601-1430-4d2a-b240-77fd97dd064e	\N	sent	\N	28	\N	\N
4f874c47-baba-463e-af2f-c5e2e80988c5	30cd859d-6a9e-4e58-8ae6-528fb1a20032	8748e7ec-fe14-49d2-97ad-418da6bacebf	text	Nahi bhai	\N	2026-05-19 09:14:52.119978+00	\N	89218dac-b9a7-4bec-aae2-a4ed7a43f706	\N	sent	\N	29	\N	\N
ce34055a-c6d4-481f-a82a-669bb00da4e1	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	text	Hello	\N	2026-05-19 14:43:06.423182+00	\N	e31528d1-c4dd-400f-a7f4-1ac372bd94c6	\N	sent	\N	1	\N	\N
6a7ecc11-7fc7-4ae4-94fa-ddda3ab7e514	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	text	Hy	\N	2026-05-19 14:44:42.200478+00	\N	89cceb20-6a74-44a1-a2c8-0cafee633df8	\N	sent	\N	2	\N	\N
4c9657c6-698b-456a-9bd0-ae5e4b847858	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	text	Ssup	\N	2026-05-19 14:44:49.374922+00	\N	98a5cd2c-2232-4ca1-a5e0-5b081ee50a9b	\N	sent	\N	3	\N	\N
dafd2ae0-962d-4d39-90ed-c8b82df17bd4	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	text	👌🏻👌🏻👌🏻	\N	2026-05-19 14:44:53.761592+00	\N	ed7257df-8e31-414f-97fc-539b9c1d6376	\N	sent	\N	4	\N	\N
42d174af-8df4-4292-b7b0-f0e70f1881a1	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	text	❤️👎🏻🫣❤️🫣❤️😀👌😀😇👍🏻👌🏻👍👌🏻👍👌🏻	\N	2026-05-19 14:44:57.878057+00	\N	4f48b3d9-2c5a-4fac-b515-b1e955df052e	\N	sent	\N	5	\N	\N
51a9f660-613f-4ae1-ac03-6569ae18b27e	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	sticker	\N	https://static.klipy.com/ii/a5166a66b33e26d783bf95ac62ea3cdb/a5/e4/7DjY7ZAB.webp	2026-05-19 14:45:38.764793+00	\N	1078d595-62ec-40ce-9d89-f2a129833747	\N	sent	\N	6	{}	\N
15345211-9493-4501-9dcf-13b93065be20	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	sticker	\N	https://static.klipy.com/ii/a5166a66b33e26d783bf95ac62ea3cdb/31/f9/jjFAGkqJ.webp	2026-05-19 14:45:49.285184+00	\N	39fb38a7-4f48-4452-8a92-18d16166f72b	\N	sent	\N	7	{}	\N
71e31cce-5abf-4a7a-8b4d-6f29142d8afe	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	sticker	\N	https://static.klipy.com/ii/f10a5b8a9a8043b917448fb0ad499733/db/fa/eN83kL7Hzygp.webp	2026-05-19 14:46:12.187052+00	\N	cb1b265e-95e4-4c84-a6f9-ba25d54e1e6e	\N	sent	\N	8	{}	\N
07dc5c96-72a7-4ea1-a5c3-9803614bf2a3	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	sticker	\N	https://static.klipy.com/ii/a5166a66b33e26d783bf95ac62ea3cdb/83/a7/HiiUnr4c.webp	2026-05-19 14:46:15.236561+00	\N	c52e2f58-826d-4e20-8766-f66ff40cefb4	\N	sent	\N	9	{}	\N
63caa0c9-51ce-42b9-af63-c5369693a30e	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	sticker	\N	https://static.klipy.com/ii/a5166a66b33e26d783bf95ac62ea3cdb/15/82/B0lbUtBH.webp	2026-05-19 14:46:15.466103+00	\N	59f9beb2-5ffb-4373-9503-ff1cb6423643	\N	sent	\N	10	{}	\N
5fb0d194-320c-494f-a511-23916db6be78	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	sticker	\N	https://static.klipy.com/ii/ffd4ac143e6335ac68951b787d3c1902/8c/36/A9KGmLJG.webp	2026-05-19 14:46:18.652471+00	\N	e0787e58-092f-4adc-9d51-63e92d406729	\N	sent	\N	11	{}	\N
0e4b18a8-19cc-4499-83ce-a5bdec512f19	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	sticker	\N	https://static.klipy.com/ii/a5166a66b33e26d783bf95ac62ea3cdb/15/5e/bGcu7eTe.webp	2026-05-19 14:46:28.366724+00	\N	4a840519-5e06-4511-ad86-89c2ac6ce1f4	\N	sent	\N	12	{}	\N
06dbfe71-8684-4a04-ad1d-f4f78abffe45	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	music	\N	\N	2026-05-19 14:48:12.392114+00	\N	12f60f33-4583-48e8-a8ad-a7d975aaa00f	{"id": 1516503241, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/26/19/fd/2619fd1b-47e4-79e3-ea21-76701c1b7b40/8903431777126_cover.jpg/300x300bb.jpg", "title": "O Saki Saki (From \\"Batla House\\")", "artist": "Neha Kakkar, Tulsi Kumar & B. Praak", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/16/63/2c/16632cd6-b022-96e9-2fa5-3b209fd568b6/mzaf_10747445059300180724.plus.aac.p.m4a"}	sent	\N	13	\N	\N
bae803aa-84ab-4349-a56a-3a4bcb68a7ab	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	music	\N	\N	2026-05-19 14:48:51.094705+00	\N	b9ff1663-b3ae-4bab-a4ee-1c59504ad310	{"id": 1802869031, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/ac/3b/26ac3b10-0237-e46c-14af-b28abf60f0e1/5021732749444.jpg/300x300bb.jpg", "title": "Sirra", "artist": "Guru Randhawa, Kiran Bajwa & Rony Ajnali", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8f/01/9d/8f019d2d-c3b1-2110-e770-f756ba65af30/mzaf_8272177533147304530.plus.aac.p.m4a"}	sent	\N	14	\N	\N
92bc7630-d1b4-499b-a8ea-2b13f4e484a0	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	text	1. Audio msg not working	\N	2026-05-19 14:49:47.651365+00	\N	d57abf95-37a8-4e29-acda-4ddbae7c6e46	\N	sent	\N	15	\N	\N
840b2ccd-6616-44df-aa45-0f7a12f42683	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	text	2. Cannot share Media( photos videos )	\N	2026-05-19 14:50:14.698789+00	\N	4e71e4f0-8112-4d85-ac1f-f56921e3e87f	\N	sent	\N	16	\N	\N
adc62df3-7ad5-4895-9625-012151583782	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	text	3. Stickers are not so genz coded, improvisation is needed	\N	2026-05-19 14:50:35.495892+00	\N	55048021-3991-414d-b5da-ce2c0979a3c2	\N	sent	\N	17	\N	\N
c06bcb9a-b5e9-424b-82b6-1fdc0bb007c7	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	text	4. Can't be able to create quiz	\N	2026-05-19 14:51:16.050998+00	\N	6ad5edd8-1245-486f-932a-aaa3f967ae49	\N	sent	\N	18	\N	\N
6a5d572e-6830-4403-b010-d1fa90f7146d	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	text	5. After clicking once in stickers, it doesn't get sent. We have to click it one more time	\N	2026-05-19 14:52:28.735778+00	\N	63328f0c-769c-41ad-b1da-e167be396d6d	\N	sent	\N	19	\N	\N
6f06b260-366c-4948-9e30-dadc544af65d	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	text	6. Musics are not updated. Cannot be able to share recently released musics	\N	2026-05-19 14:53:03.925882+00	\N	cc569cd7-233a-4eb7-a150-f15cc23fd968	\N	sent	\N	20	\N	\N
8a1ce403-e220-4d1b-95d3-3de9b2a2d600	49591d23-e6ff-40dd-8732-e54866662a4a	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	text	7. Theme based chat is required	\N	2026-05-19 14:54:56.818893+00	\N	a582e910-b95e-4f6d-b817-c5302727df60	\N	sent	\N	21	\N	\N
25e3193b-df8e-4259-9f69-4adbb6b0b890	49591d23-e6ff-40dd-8732-e54866662a4a	a44fc361-91c7-4c47-b215-4dd528ca71d1	text	Good point	\N	2026-05-19 15:02:01.994076+00	\N	59b56b0b-9106-4b56-8af2-4cc5f5aaed73	\N	sent	\N	22	\N	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.notifications (id, recipient_id, actor_id, type, story_id, metadata, is_read, is_deleted, created_at) FROM stdin;
41285c61-a693-4cb3-bca6-61c20f2bcd1e	7a866a5b-e250-4c17-93eb-16b1b1ac090d	\N	PROFILE_COMPLETION	\N	{"reward": 70, "message": "Profile completed successfully"}	t	f	2026-05-08 11:49:45.38555+00
1d0e3b1e-c341-4429-8c8f-a4a55ffd736d	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	\N	PROFILE_COMPLETION	\N	{"reward": 70, "message": "Profile completed successfully"}	t	f	2026-05-09 12:00:22.174838+00
c5b377d2-359f-48a7-a6cf-5098de1525e0	fefee755-45b5-4cc1-b870-60c6ca2d99a5	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	FOLLOW	\N	{}	t	f	2026-05-09 12:15:44.604043+00
f30e849c-337b-40cb-8a62-103124ed45c9	fefee755-45b5-4cc1-b870-60c6ca2d99a5	\N	PROFILE_COMPLETION	\N	{"reward": 70, "message": "Profile completed successfully"}	t	f	2026-05-09 12:21:25.995483+00
b64198f1-def8-4903-bc76-263e58335214	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	fefee755-45b5-4cc1-b870-60c6ca2d99a5	FOLLOW	\N	{}	t	f	2026-05-09 12:14:52.346566+00
6dd0ba10-8a25-4e00-afb5-f2c7c353d822	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	\N	PROFILE_COMPLETION	\N	{"reward": 70, "message": "Profile completed successfully"}	t	f	2026-05-08 12:47:57.087518+00
e89dc85a-b199-48f9-a76a-974cb166af7e	7a866a5b-e250-4c17-93eb-16b1b1ac090d	f11b0807-16f0-46a8-894a-075fa92a1204	FOLLOW	\N	{}	t	f	2026-05-10 14:04:45.758048+00
59bc2091-69e2-415c-836c-df539a0abfa9	f11b0807-16f0-46a8-894a-075fa92a1204	7a866a5b-e250-4c17-93eb-16b1b1ac090d	FOLLOW	\N	{}	f	f	2026-05-12 14:18:20.713229+00
1ce18f20-cc93-4cff-be07-a14126fbc2a5	573ac182-4ab9-4ad7-bd6e-5b15437d7066	\N	PROFILE_COMPLETION	\N	{"reward": 70, "message": "Profile completed successfully"}	t	f	2026-05-15 14:46:59.366635+00
b5a3acad-2467-476e-9b36-69392ccfc11b	8748e7ec-fe14-49d2-97ad-418da6bacebf	\N	PROFILE_COMPLETION	\N	{"reward": 70, "message": "Profile completed successfully"}	t	f	2026-05-18 16:08:09.473344+00
ffadfd5a-1828-4f89-a609-32948d53c726	8c5fd867-b035-4eb1-bb71-54e661861dfd	8748e7ec-fe14-49d2-97ad-418da6bacebf	FOLLOW	\N	{}	t	f	2026-05-18 16:30:19.621003+00
b978d1e3-8bef-453b-9faf-ec79856fad3f	8748e7ec-fe14-49d2-97ad-418da6bacebf	8c5fd867-b035-4eb1-bb71-54e661861dfd	FOLLOW	\N	{}	t	f	2026-05-18 16:30:22.730673+00
3339f68c-c128-4b2c-be7e-94948e2b11ea	573ac182-4ab9-4ad7-bd6e-5b15437d7066	a44fc361-91c7-4c47-b215-4dd528ca71d1	FOLLOW	\N	{}	f	f	2026-05-19 07:30:13.036494+00
4bec603b-7ad1-43f7-937f-420acf977d19	20e3d541-f336-4e5c-b959-d3c80a5d6325	a44fc361-91c7-4c47-b215-4dd528ca71d1	FOLLOW	\N	{}	t	f	2026-05-15 08:56:52.150973+00
d069ed7e-0f36-4c8a-a424-1d752e8feb31	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	\N	PROFILE_COMPLETION	\N	{"reward": 70, "message": "Profile completed successfully"}	t	f	2026-05-18 23:44:29.294813+00
15fa84ae-924a-4f7f-916b-a12535acb5a9	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	a44fc361-91c7-4c47-b215-4dd528ca71d1	FOLLOW	\N	{}	t	f	2026-05-19 07:30:05.201899+00
fec43c47-5551-4c9d-9caf-5de62889b6c8	a44fc361-91c7-4c47-b215-4dd528ca71d1	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	FOLLOW	\N	{}	t	f	2026-05-19 14:42:34.173745+00
7122e8d6-6105-4dd6-a398-6d8d30327c92	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	20e3d541-f336-4e5c-b959-d3c80a5d6325	FOLLOW	\N	{}	f	f	2026-05-19 17:47:27.528203+00
8c52616f-54cd-4548-a1dc-d88d6c14621f	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	\N	PROFILE_COMPLETION	\N	{"reward": 70, "message": "Profile completed successfully"}	t	f	2026-05-19 12:24:38.503432+00
5909b36e-76bd-4ae0-bad4-0ea133a8292d	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	FOLLOW	\N	{}	f	f	2026-05-20 05:34:22.718063+00
307b0b9f-41ef-40e8-9872-beb01c865971	7a866a5b-e250-4c17-93eb-16b1b1ac090d	8748e7ec-fe14-49d2-97ad-418da6bacebf	FOLLOW	\N	{}	t	f	2026-05-18 15:55:26.099688+00
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.refresh_tokens (id, user_id, token, created_at, device_id, expires_at, last_used_at) FROM stdin;
89	26e1a1e0-203b-4f46-90d6-91077cf2ebb2	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNmUxYTFlMC0yMDNiLTRmNDYtOTBkNi05MTA3N2NmMmViYjIiLCJpYXQiOjE3Nzg1NzI1NzYsImV4cCI6MTc3OTE3NzM3Nn0.mG3rVYiBTiCMfn2Z2EFuAIR5WQMSfwUz28gg0ql0vW0	2026-05-12 07:56:16.325253	3d024bd1-a539-4074-810b-25483599c612	2026-05-19 07:56:16.325253	\N
172	7a866a5b-e250-4c17-93eb-16b1b1ac090d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YTg2NmE1Yi1lMjUwLTRjMTctOTNlYi0xNmIxYjFhYzA5MGQiLCJpYXQiOjE3NzkyNTYxNzMsImV4cCI6MTc3OTg2MDk3M30.9dBCqxCf_7X4Ya6Jp1oglU2l3fRnpYO7ON7GKCD1Saw	2026-05-20 05:49:33.52357	167e34af-5a18-42a3-b122-c9ed3ef20b1b	2026-05-27 05:49:33.52357	\N
174	8c5fd867-b035-4eb1-bb71-54e661861dfd	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4YzVmZDg2Ny1iMDM1LTRlYjEtYmI3MS01NGU2NjE4NjFkZmQiLCJpYXQiOjE3NzkyNTY5ODQsImV4cCI6MTc3OTg2MTc4NH0.RtdqTnJoNYLW56XuFr4aRArWzIAAc1tYGl6W1KCI3q0	2026-05-20 06:03:04.854669	eeddd47e-fb62-4621-8177-33135eff2d95	2026-05-27 06:03:04.854669	\N
178	d93c5f5b-25d3-4e7b-8e4d-7afcbfc1c0cf	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkOTNjNWY1Yi0yNWQzLTRlN2ItOGU0ZC03YWZjYmZjMWMwY2YiLCJpYXQiOjE3NzkzNDM0MTksImV4cCI6MTc3OTk0ODIxOX0.gZczDRdKSNll2MYEjRgP1zz-f1Mw363XrDlNpbyHOwg	2026-05-21 06:03:39.732303	97892a43-2f06-4aab-b506-e78d32f8d44d	2026-05-28 06:03:39.732303	\N
14	7a866a5b-e250-4c17-93eb-16b1b1ac090d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YTg2NmE1Yi1lMjUwLTRjMTctOTNlYi0xNmIxYjFhYzA5MGQiLCJpYXQiOjE3NzgyNDEzMzUsImV4cCI6MTc3ODg0NjEzNX0.4A5KgVBx12H-vcJjAJiCrkCh_JNBEXaoxPCV4U1eS7g	2026-05-08 11:55:35.276224	92f10d84-663f-4947-8f8c-5f3e4b89828a	2026-05-15 11:55:35.276224	\N
100	464063c3-9b17-486c-8cb6-5c0ce2ebac2d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0NjQwNjNjMy05YjE3LTQ4NmMtOGNiNi01YzBjZTJlYmFjMmQiLCJpYXQiOjE3Nzg1OTQ5NjEsImV4cCI6MTc3OTE5OTc2MX0.lkwarVXZYzevi5CY4er7KQLrNHTNfVXGrpv52BfANtg	2026-05-12 14:09:21.737927	88d22219-6e87-450a-b68e-f8a5ab0fbcb2	2026-05-19 14:09:21.737927	\N
102	fefee755-45b5-4cc1-b870-60c6ca2d99a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZWZlZTc1NS00NWI1LTRjYzEtYjg3MC02MGM2Y2EyZDk5YTUiLCJpYXQiOjE3Nzg1OTYxOTgsImV4cCI6MTc3OTIwMDk5OH0.p0oOF6Wjmnqr96K__T9L53vva9_5GpOhxjRDNeb-dkk	2026-05-12 14:29:58.52673	4dfb714c-7f24-44ad-8f13-d6f6030796e9	2026-05-19 14:29:58.52673	\N
26	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZmRkOTJlOS1iY2NlLTRlZjAtOGM1MC0zZTQ0NmZkNWY2MmIiLCJpYXQiOjE3NzgzMjkzNDksImV4cCI6MTc3ODkzNDE0OX0.4tQNrRELq1kl9IK0c-5-BAbn7eXWn7h93grU9dpyvQY	2026-05-09 12:22:29.651162	04133c4e-910a-4517-a075-b4086642a955	2026-05-16 12:22:29.651162	\N
107	a3deaca4-2c97-410b-957e-7f1e555e41fa	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhM2RlYWNhNC0yYzk3LTQxMGItOTU3ZS03ZjFlNTU1ZTQxZmEiLCJpYXQiOjE3Nzg2NjAwNTAsImV4cCI6MTc3OTI2NDg1MH0.A2XQ6cneaF5kMFWT2nK4omAbLoUbgjF6BKwZMRwjjko	2026-05-13 08:14:10.226215	62feb82a-8ce7-44f7-b20e-d69bf00f753b	2026-05-20 08:14:10.226215	\N
109	ec34bde8-4031-448c-867d-fdec468b7f7d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYzM0YmRlOC00MDMxLTQ0OGMtODY3ZC1mZGVjNDY4YjdmN2QiLCJpYXQiOjE3Nzg2OTY0NTgsImV4cCI6MTc3OTMwMTI1OH0.Byf9ySu10lIeLjTm4FIP4-icAgOB0pSumVCw5v9aKVg	2026-05-13 18:20:58.630704	cddb3eba-a9dd-4069-aee5-97ee9cfefd24	2026-05-20 18:20:58.630704	\N
111	c5c33302-4369-49ae-bc34-b4aa65def5a1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNWMzMzMwMi00MzY5LTQ5YWUtYmMzNC1iNGFhNjVkZWY1YTEiLCJpYXQiOjE3Nzg3NzY5ODIsImV4cCI6MTc3OTM4MTc4Mn0.LpydUXRc_qxuzBbgvyN-5zYrqmo6mIeGCpIdDklfOPk	2026-05-14 16:43:02.371784	6114d450-d014-45af-b510-5c4a11d49192	2026-05-21 16:43:02.371784	\N
38	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZmRkOTJlOS1iY2NlLTRlZjAtOGM1MC0zZTQ0NmZkNWY2MmIiLCJpYXQiOjE3NzgzMzQwNzIsImV4cCI6MTc3ODkzODg3Mn0.JZmhkvHLD68d_Q8zJroO4oB0r6Ms1Q6rwvaCljKGdTA	2026-05-09 13:41:12.148063	520154bb-b3ef-46b0-9aa2-e951b5ce9b4e	2026-05-16 13:41:12.148063	\N
121	7b6df3fd-e8ee-4201-9155-a62ff3d5d11c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YjZkZjNmZC1lOGVlLTQyMDEtOTE1NS1hNjJmZjNkNWQxMWMiLCJpYXQiOjE3Nzg4MjcyODYsImV4cCI6MTc3OTQzMjA4Nn0.SPek53VRTN30prRgdxlsnimagze3Ed2NI_w8m6w2o4s	2026-05-15 06:41:26.5457	3efc8032-9bf7-47d3-958b-0ef3ad8b5a88	2026-05-22 06:41:26.5457	\N
51	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwOGU2ZDhlNi1iZTYwLTQxMDctOGZmMi1jYzllZjA1YWI2ZjUiLCJpYXQiOjE3NzgzOTcyODcsImV4cCI6MTc3OTAwMjA4N30.cvVzcJlwEUakR9wTspfMaa5NjQmq2YCFV-2RqEq0lvg	2026-05-10 07:14:47.438004	7ced845c-f27d-4758-b6c9-4a8c768506b5	2026-05-17 07:14:47.438004	\N
53	ec34bde8-4031-448c-867d-fdec468b7f7d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlYzM0YmRlOC00MDMxLTQ0OGMtODY3ZC1mZGVjNDY4YjdmN2QiLCJpYXQiOjE3Nzg0MDYwMjEsImV4cCI6MTc3OTAxMDgyMX0.iPdGNBh9xnOR_kYyLr5Fo_epkbe5mfP52ShdhzpxPJs	2026-05-10 09:40:21.810553	05d285a4-95fb-40b8-ada5-52fb1b0314d2	2026-05-17 09:40:21.810553	\N
57	f11b0807-16f0-46a8-894a-075fa92a1204	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmMTFiMDgwNy0xNmYwLTQ2YTgtODk0YS0wNzVmYTkyYTEyMDQiLCJpYXQiOjE3Nzg0MjE4MjksImV4cCI6MTc3OTAyNjYyOX0.np5EBxDKdP6rFbsYsLuIX8PlS-O0NUnxF7k4cwC5xNw	2026-05-10 14:03:49.362084	7e115903-adf1-4893-bd8c-be928d3e97d6	2026-05-17 14:03:49.362084	\N
59	fefee755-45b5-4cc1-b870-60c6ca2d99a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZWZlZTc1NS00NWI1LTRjYzEtYjg3MC02MGM2Y2EyZDk5YTUiLCJpYXQiOjE3Nzg0MjI3NzYsImV4cCI6MTc3OTAyNzU3Nn0.uq8Mrz8eM_bxZ1joSSXSI0SmMkeLDzwyifx4Be_f8Jw	2026-05-10 14:19:36.906422	1c717108-6806-41e1-8524-25503d442035	2026-05-17 14:19:36.906422	\N
63	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZmRkOTJlOS1iY2NlLTRlZjAtOGM1MC0zZTQ0NmZkNWY2MmIiLCJpYXQiOjE3Nzg0NDM4MDYsImV4cCI6MTc3OTA0ODYwNn0.Tti92ERvq-EB0AkNJ9rz6nF5R-vwZsRLhlPwA5YC-VQ	2026-05-10 20:10:06.552701	411b6f43-e49d-4083-bc6e-e393265df29c	2026-05-17 20:10:06.552701	\N
69	7a3f6c05-24ce-4b4e-975c-d70e7867d818	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YTNmNmMwNS0yNGNlLTRiNGUtOTc1Yy1kNzBlNzg2N2Q4MTgiLCJpYXQiOjE3Nzg0ODE3MTMsImV4cCI6MTc3OTA4NjUxM30.cHA0Ato1MjJIIhW6AdO-Caf4qksNVZ2mOXaS63VLv9U	2026-05-11 06:41:53.364812	70c26c35-b3ef-4129-bc6d-f2466c3d30d6	2026-05-18 06:41:53.364812	\N
75	2c575cfe-fdb1-4252-8b4a-dc44685b014c	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyYzU3NWNmZS1mZGIxLTQyNTItOGI0YS1kYzQ0Njg1YjAxNGMiLCJpYXQiOjE3Nzg1MDEyODcsImV4cCI6MTc3OTEwNjA4N30.tNUBNv16dbTxYSd2r710WVGQJ0IE8aO-5jVNwJBIGbU	2026-05-11 12:08:07.287945	2b741a2f-a5cd-425e-ab74-79ecda2599bf	2026-05-18 12:08:07.287945	\N
81	176033e8-b3ae-4a69-ae7b-65070790a480	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNzYwMzNlOC1iM2FlLTRhNjktYWU3Yi02NTA3MDc5MGE0ODAiLCJpYXQiOjE3Nzg1MDgzMjAsImV4cCI6MTc3OTExMzEyMH0.bm_AlZ-bMq9ibOgGmQliOCQ54B5jYFA-pbwUxpB5D08	2026-05-11 14:05:20.020137	6fd397bb-b001-4a75-9b99-0cd7e6dbec15	2026-05-18 14:05:20.020137	\N
82	fefee755-45b5-4cc1-b870-60c6ca2d99a5	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZWZlZTc1NS00NWI1LTRjYzEtYjg3MC02MGM2Y2EyZDk5YTUiLCJpYXQiOjE3Nzg1Mjc2MjgsImV4cCI6MTc3OTEzMjQyOH0.LIVwMXl_GPYQ7-1VEfvYM8S91SXqaUvnkt9SxA_RmJQ	2026-05-11 19:27:08.806472	9e1c0e10-55e4-4e78-9e7f-05e6ec74162d	2026-05-18 19:27:08.806472	\N
85	c5633ca7-a98e-416b-b401-ac3e3b6f3611	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNTYzM2NhNy1hOThlLTQxNmItYjQwMS1hYzNlM2I2ZjM2MTEiLCJpYXQiOjE3Nzg1NjYzNjcsImV4cCI6MTc3OTE3MTE2N30.bkuqHax7-78x0BoFgYvMNNkWjS391zkePIEN9zOStWQ	2026-05-12 06:12:47.091561	ff83d8cb-9d27-4ec8-8ba9-5e02607d64f3	2026-05-19 06:12:47.091561	\N
125	3ef3e217-199f-445b-a44d-2f9a935d3c00	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZWYzZTIxNy0xOTlmLTQ0NWItYTQ0ZC0yZjlhOTM1ZDNjMDAiLCJpYXQiOjE3Nzg4MzAyNjIsImV4cCI6MTc3OTQzNTA2Mn0.9ysXU2Z4pk4rz4q8hA3O0ay6S4iOVnFaxg9TcmryaqQ	2026-05-15 07:31:02.034029	5c25dcc0-67df-456f-87f5-d916d97d3528	2026-05-22 07:31:02.034029	\N
175	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlNGFjMTdjMC1lODBiLTRkYWItODc4ZS1iZDRjNTljZDFhYzgiLCJpYXQiOjE3NzkyOTA5NDksImV4cCI6MTc3OTg5NTc0OX0.o_Pm_KyAFVd8Spx69-j72nHFhaGZB3r-hZLAkLx56g0	2026-05-20 15:29:09.251526	d52b1b19-98c5-418a-bdf0-f0651218db87	2026-05-27 15:29:09.251526	\N
127	20e3d541-f336-4e5c-b959-d3c80a5d6325	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMGUzZDU0MS1mMzM2LTRlNWMtYjk1OS1kM2M4MGE1ZDYzMjUiLCJpYXQiOjE3Nzg4MzI4MjYsImV4cCI6MTc3OTQzNzYyNn0.IQCWrliY6QRs5rGVOjsRWS_kQBDJ75SqQyNreYsni9c	2026-05-15 08:13:46.990372	ed64f7b8-50f1-4116-b8d0-583789338e0d	2026-05-22 08:13:46.990372	\N
179	7a866a5b-e250-4c17-93eb-16b1b1ac090d	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3YTg2NmE1Yi1lMjUwLTRjMTctOTNlYi0xNmIxYjFhYzA5MGQiLCJpYXQiOjE3NzkzNDM2MzMsImV4cCI6MTc3OTk0ODQzM30.j2kks2xiJ6chxp9YbtuQ7n6csxYBu_hSUMc4F4hGvRM	2026-05-21 06:07:13.320875	d1647cfb-03c2-44d6-b006-71635eac61dd	2026-05-28 06:07:13.320875	\N
138	236ea5fd-d13e-4273-b70d-f8e06e32f1b4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMzZlYTVmZC1kMTNlLTQyNzMtYjcwZC1mOGUwNmUzMmYxYjQiLCJpYXQiOjE3Nzg5MzcxODksImV4cCI6MTc3OTU0MTk4OX0.hBHNHPFPzyHKK9CTGdJXVHPnpmRRcGAHV_OoByZYjRg	2026-05-16 13:13:09.307302	430d4d02-1a17-4790-ac69-5d1340e7332e	2026-05-23 13:13:09.307302	\N
140	573ac182-4ab9-4ad7-bd6e-5b15437d7066	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NzNhYzE4Mi00YWI5LTRhZDctYmQ2ZS01YjE1NDM3ZDcwNjYiLCJpYXQiOjE3NzkwMTU0OTIsImV4cCI6MTc3OTYyMDI5Mn0.sk-n6S_QsixPuoo0zp9-CEvVunZF9tC8JE08HoCPVRg	2026-05-17 10:58:12.619271	3d9ed74c-7d40-4762-ad47-a24d24d86b97	2026-05-24 10:58:12.619271	\N
141	d9549f44-0bd6-44be-8dc6-c8272f3ddea4	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkOTU0OWY0NC0wYmQ2LTQ0YmUtOGRjNi1jODI3MmYzZGRlYTQiLCJpYXQiOjE3NzkwODQyMjQsImV4cCI6MTc3OTY4OTAyNH0.O8ONpppSTX95IUqg5S-Z-DuyzU39u5NNPfvsoTOGmYA	2026-05-18 06:03:44.429187	75416266-ad55-4407-aade-46f1206a36da	2026-05-25 06:03:44.429187	\N
165	8748e7ec-fe14-49d2-97ad-418da6bacebf	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4NzQ4ZTdlYy1mZTE0LTQ5ZDItOTdhZC00MThkYTZiYWNlYmYiLCJpYXQiOjE3NzkyMDE4NTYsImV4cCI6MTc3OTgwNjY1Nn0.wAgUYbJzpG2Bpi69I6O62OLM9aY6em5RqZ-6okppUmA	2026-05-19 14:44:16.406576	d4627664-652b-4894-a87d-e470750c395f	2026-05-26 14:44:16.406576	\N
166	a44fc361-91c7-4c47-b215-4dd528ca71d1	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhNDRmYzM2MS05MWM3LTRjNDctYjIxNS00ZGQ1MjhjYTcxZDEiLCJpYXQiOjE3NzkyMDIzODQsImV4cCI6MTc3OTgwNzE4NH0.ieauSrOiTGpLH9EmVXl3N3wnEcHnVsq3BjGjCHcSvCA	2026-05-19 14:53:04.989545	3efc8032-9bf7-47d3-958b-0ef3ad8b5a88	2026-05-26 14:53:04.989545	\N
167	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YzEwNmQ0ZS03YzRjLTQ2OTAtYmFlYy1kN2JmNmY2MmU0NWUiLCJpYXQiOjE3NzkyMDUyOTYsImV4cCI6MTc3OTgxMDA5Nn0.0-TaaGROm4NAhWgoPfF2SSVx-EYWSCLohpjDKLR6df4	2026-05-19 15:41:36.071557	00c714ca-f00f-4072-bd23-7a168b5abc96	2026-05-26 15:41:36.071557	\N
169	20e3d541-f336-4e5c-b959-d3c80a5d6325	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMGUzZDU0MS1mMzM2LTRlNWMtYjk1OS1kM2M4MGE1ZDYzMjUiLCJpYXQiOjE3NzkyMTI4MTgsImV4cCI6MTc3OTgxNzYxOH0.2JG2KFEIgnntrms3DWMxqQRYMEVlhTfwQ6OvxQBq3kc	2026-05-19 17:46:58.664888	6e96c1da-2e34-46fe-b14f-8ecd30d479ab	2026-05-26 17:46:58.664888	\N
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.stories (id, user_id, media_url, type, caption, music, aura_count, comment_count, like_count, location, created_at, geminiaura, geminicomment, blurhash, local_id, server_url, status, ai_rejected_response, retry_count, last_retry_at, added_at, upload_retry_count, last_upload_retry_at, tagged_users, layers) FROM stdin;
a7bb2833-955a-4cde-99fc-d9f0a0a2788b	7a866a5b-e250-4c17-93eb-16b1b1ac090d	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/63fcce11-e7e6-4165-9f09-f6e01ede2e69.jpeg	image		{"id": 1575202932, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2c/b1/ed/2cb1ed46-6c05-6b4c-b372-8a57fb957bd4/859748851470_cover.jpg/300x300bb.jpg", "title": "Daikho", "artist": "Kaavish", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/ee/ec/f8/eeecf81c-8eca-7e86-0900-b89e475600cd/mzaf_11102576527920623905.plus.aac.p.m4a"}	0	0	0		2026-05-08 11:52:42.406886+00	40	Your presence feels so calm and effortlessly genuine.	UWI=3_%L9Gxu_NozRjof01bIoJRPMwj@RkRj	afd5cc60-5b64-4b65-8e20-c11c5c90579f	\N	ACCEPTED	\N	0	\N	2026-05-08 11:52:42.406886+00	1	2026-05-08 11:52:56.485895+00	[]	[]
b365e0c5-2136-4736-a8a1-a8a18f5a1313	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/462ff301-9c49-46d6-b2ab-215a2c1adc11.jpeg	image		\N	5	0	0		2026-05-09 12:14:52.633402+00	8	Your vibe when the music hits is a whole mood fr.	U27c~f={0z$k$%WVWVs:00E2}@J69]s.xGI:	121b040c-768f-40ef-82ba-d545efd026ae	\N	ACCEPTED	\N	0	\N	2026-05-09 12:14:52.633402+00	1	2026-05-09 12:15:06.872438+00	[]	[]
4dc98f67-976f-466b-b3d3-adcbea933bd3	fefee755-45b5-4cc1-b870-60c6ca2d99a5	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/6eb8535d-9fbd-4e82-a68c-7172696efaf7.jpeg	image		\N	10	0	0		2026-05-09 12:27:06.269096+00	15	Capturing the bigger picture with a clean and focused vibe.	UGC?$IaI00N#?aayM{of00bd~pxA0LoJ-oWB	73a5c5e8-0913-47db-abb9-e0cd9239648e	\N	ACCEPTED	\N	0	\N	2026-05-09 12:27:06.269096+00	1	2026-05-09 12:27:22.635412+00	[]	[]
81ad56db-2753-46be-94a5-cc29ce45b214	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/c73a90e8-8075-4978-b669-d58f2cf66c77.jpeg	image		{"id": 785232521, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/be/27/91/be279120-2285-16c6-c7ba-9d6643d4a948/075992732727.jpg/300x300bb.jpg", "title": "Paranoid", "artist": "Black Sabbath", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/87/7e/c4/877ec400-6e44-8bc4-bb22-b88273a3330d/mzaf_15381783367282008011.plus.aac.p.m4a"}	0	0	0		2026-05-09 13:46:01.297034+00	32	Your aesthetic is the danger; a truly legendary and powerful vibe.	UAB|f@?a00X47JR*$ikW01M{x@Rk}@t7IpV?	296750d7-96cf-4242-af2d-f8021cfa95bf	\N	ACCEPTED	\N	0	\N	2026-05-09 13:46:01.297034+00	1	2026-05-09 13:46:24.245421+00	[]	[]
21e76cb8-1e92-42ed-af0f-5b3dd1471fd8	c5c33302-4369-49ae-bc34-b4aa65def5a1	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/33468864-13c0-4476-8146-e25b64b0aeaa.jpeg	image		\N	0	0	0		2026-05-11 11:35:29.851825+00	0	A vibe so deep even darkness can't contain its mystery.	U00000fQfQfQfQfQfQfQfQfQfQfQfQfQfQfQ	15e5d4c0-ad6e-4d55-bcd4-7324bb88a85c	\N	ACCEPTED	\N	0	\N	2026-05-11 11:35:29.851825+00	1	2026-05-11 11:35:39.868834+00	[]	[]
8ae0900f-7746-4215-a753-7025f37ee334	ec34bde8-4031-448c-867d-fdec468b7f7d	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/219891cf-e562-4732-a6a5-014f7bbc9a64.jpeg	image		\N	0	0	0		2026-05-12 07:58:43.338493+00	38	The community vibe and shared energy in this moment is everything.	U5CZFU.R00xC00VZ~pX5S#r?tLoz}wO=Vyi{	d4eab68c-ef88-4dc7-a87d-cbbc9a806de0	\N	ACCEPTED	\N	0	\N	2026-05-12 07:58:43.338493+00	1	2026-05-12 07:59:06.206767+00	[]	[]
b9ae791f-9ed7-4cfd-bb15-fe25018b620d	d9549f44-0bd6-44be-8dc6-c8272f3ddea4	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/e9b5fcce-11d5-4a61-aa5d-84dc0ddd3d9a.jpeg	image		\N	0	0	0		2026-05-14 17:59:53.459844+00	1	Your digital space has such a calm and organized aesthetic.	U01.]Pxw8wRO%it8aJRiQ,aypIoLMHRipJt8	8a456b1b-e340-4ee9-9cc2-6da8c381b4cb	\N	ACCEPTED	\N	0	\N	2026-05-14 17:59:53.459844+00	1	2026-05-14 18:00:14.786289+00	[]	[]
b5991023-a5e3-435b-856c-0cf09e5c350c	d9549f44-0bd6-44be-8dc6-c8272f3ddea4	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/3914c53f-0599-47fe-9f4e-5f4fb5b6674c.jpeg	image		\N	0	0	0		2026-05-18 06:05:22.533643+00	1	Your vibe connects faster than this internet speed test, for sure.	U142PEt800ox~qogD%WB9EoexuM|4nbE%MRk	fb3a816a-5815-4767-b207-03c3f41da6b1	\N	ACCEPTED	\N	0	\N	2026-05-18 06:05:22.533643+00	1	2026-05-18 06:05:38.740571+00	[]	[]
c2ca48b3-3571-46bb-b202-2165ece21bfc	8748e7ec-fe14-49d2-97ad-418da6bacebf	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/878f00c3-b216-4b0d-ac42-44353125b0f0.jpeg	image		{"id": 1804729822, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6e/a2/1b/6ea21b60-3155-9aac-fdd8-0579af266a1c/199066651063.jpg/300x300bb.jpg", "title": "Meri Baggi", "artist": "Seedhe Maut & Sez on the Beat", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e2/b8/26/e2b82676-6f85-f60e-29ab-a55f63113629/mzaf_13257374626570126739.plus.aac.p.m4a"}	0	0	0		2026-05-18 16:10:58.570055+00	1	Celebrating those academic wins and future achievements is a whole vibe.	U95hx-V@R-Rk?wofNGWDxExuIof+xXoeRkWV	1d8eff19-5e67-462a-960f-d03bead257e9	\N	ACCEPTED	\N	0	\N	2026-05-18 16:10:58.570055+00	1	2026-05-18 16:11:15.464065+00	[]	[]
f5023f0a-1b99-4c13-b678-93a3e76c7ecc	8748e7ec-fe14-49d2-97ad-418da6bacebf	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/9ad29663-49db-4e4b-b87b-b35691c8a13e.jpeg	image		{"id": 1454398393, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/81/e4/f1/81e4f187-cfde-607d-a4f2-50985495456e/794043169724.jpg/300x300bb.jpg", "title": "Flight", "artist": "Hans Zimmer", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/49/dc/2f/49dc2fe4-886b-45be-0626-d326aab12560/mzaf_5537178008867094801.plus.aac.p.m4a"}	0	0	0		2026-05-19 03:18:00.654547+00	14	Even the simplest moments in your journey have such a comforting vibe.	USD9P2~WtRxaNHa#s;of9uIpRjNGMxM{R*WV	25a607f9-1167-4991-8306-debdf6746082	\N	ACCEPTED	\N	0	\N	2026-05-19 03:18:00.654547+00	1	2026-05-19 03:18:16.594673+00	[]	[]
eb0eefad-3988-40d8-9eeb-11f1ee11cbdf	5c106d4e-7c4c-4690-baec-d7bf6f62e45e	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/1581b601-6084-49a2-9609-cb1795742dd4.jpeg	image		\N	0	0	0		2026-05-19 14:57:01.308881+00	16	Finding the hidden poetry in the city's everyday chaos.	UMDS|3M|4m-;?wRkITxt9ZogoeRiD%xutRM{	751c52c7-6ca0-4e70-991c-ee0eb132096f	\N	ACCEPTED	\N	0	\N	2026-05-19 14:57:01.308881+00	1	2026-05-19 14:57:20.553468+00	[]	[]
16070452-8846-4ed0-bd01-0434b7da0ed6	a44fc361-91c7-4c47-b215-4dd528ca71d1	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/8e35719d-4c70-458f-a75e-57fd39b496a7.jpeg	image		{"id": 1366584370, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/44/b3/f8/44b3f846-6e2f-100b-653e-93883e188ccc/191773209018.jpg/300x300bb.jpg", "title": "Abhi Na Jao Chhod Kar", "artist": "Asha Bhosle & Mohd. Rafi", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/94/66/da/9466dad3-d0e8-62b7-c572-f50ba588857c/mzaf_13435539758351865861.plus.aac.p.m4a"}	0	0	0	Bhubaneswar, Odisha, India	2026-05-19 15:01:00.691987+00	1	Your thoughts have a quiet depth and a beautiful, calming vibe.	UeGjgMr=9t%2~BnhIotR5+axsASh5RkCs:R*	19cea73d-0957-48b3-861e-e4458dd7ec09	\N	ACCEPTED	\N	0	\N	2026-05-19 15:01:00.691987+00	1	2026-05-19 15:01:11.233335+00	[{"userId": "5c106d4e-7c4c-4690-baec-d7bf6f62e45e", "hasAccepted": true}]	[]
3223b965-c569-44be-be4d-173d1ce8309f	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/stories/3bb327e0-5fee-4eeb-b4d4-9af9f784a246.jpeg	image		\N	0	0	0		2026-05-20 05:37:49.739212+00	18	Your vibe is like finding soft moonlight in the deepest of nights.	UA7L4I00Rj_NogWAofj]00?vozDiRjt7WBWB	1b33db3e-a2b7-4fd4-92b1-fac11b06defb	\N	ACCEPTED	\N	0	\N	2026-05-20 05:37:49.739212+00	1	2026-05-20 05:38:10.777038+00	[]	[]
\.


--
-- Data for Name: story_auras; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.story_auras (id, story_id, user_id, aura, sent_on) FROM stdin;
f0aaee14-6505-4240-9cc1-7d59a147b354	b365e0c5-2136-4736-a8a1-a8a18f5a1313	fefee755-45b5-4cc1-b870-60c6ca2d99a5	5	2026-05-09 12:27:22.985731+00
a3155c83-c1f0-4397-aa42-9c553605608f	4dc98f67-976f-466b-b3d3-adcbea933bd3	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	10	2026-05-09 12:39:21.949191+00
\.


--
-- Data for Name: story_comment_likes; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.story_comment_likes (comment_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: story_comments; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.story_comments (id, story_id, user_id, text, like_count, created_at) FROM stdin;
31b23ddd-2202-4ea6-a0d1-6c657510bc47	c2ca48b3-3571-46bb-b202-2165ece21bfc	8748e7ec-fe14-49d2-97ad-418da6bacebf	Heheh 😄	0	2026-05-18 16:12:11.562019+00
c7ea6dc4-71a8-49ef-a283-928681882040	eb0eefad-3988-40d8-9eeb-11f1ee11cbdf	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	Tssting	0	2026-05-20 05:40:40.058557+00
862de24e-3b9f-47a9-912d-db6714c8d12f	3223b965-c569-44be-be4d-173d1ce8309f	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	Testing	0	2026-05-20 05:41:06.232432+00
9f7647e0-da7d-4274-9e89-cef8facde364	eb0eefad-3988-40d8-9eeb-11f1ee11cbdf	e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	Testing	0	2026-05-20 05:41:26.48479+00
\.


--
-- Data for Name: story_views; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.story_views (id, story_id, viewer_id, viewed_at, view_count) FROM stdin;
\.


--
-- Data for Name: streaks; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.streaks (id, user1_id, user2_id, type, current_count, last_updated) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.users (id, username, email, password_hash, is_verified, created_at, updated_at, refresh_token, totalstoriestoday, laststorytimestamp, aura, redeemable_aura, theme_id, zodiac, avatar, campus_id, bio, name, dob, profile_url, gender, level, hascompletedonboarding, playlist, has_accepted_chat_agreement, mood, last_mood_updated, streak) FROM stdin;
cce2b6cb-47e4-42a1-bd11-94883f72c6de	suyash	stripathi8543@gmail.com	$2b$10$NtkDmEW5.Qqkx4xNeq7okemLtWoOBuP2T9uQEgjhyslqXlOnEOKFa	f	2026-05-08 16:00:09.40243+00	2026-05-08 16:00:09.40243+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
5c106d4e-7c4c-4690-baec-d7bf6f62e45e	onuraagg	anuragnayak101@gmail.com	$2b$10$61q77TTfG3JAwQ5oK94owea.I2qCJtVPMsrZ.0hhKMwYPuq1/kLTy	t	2026-05-18 23:41:08.166178+00	2026-05-18 23:44:29.294813+00	\N	0	\N	116	70	dark	pisces	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/a14d61d1dc523d63ab5118c407003f61.jpg	\N	My vibe is cool, simple, far sightseeing, talkative and futuristic 	Anurag Nayak 	2005-12-17	anuragnayak70	Male	1	t	[]	t	\N	\N	0
564e1128-ac49-4235-9d61-6e00ca6e2835	shreyash	shreyashshirkes2leo@gmail.com	$2b$10$Ffr7Iqeooei3i4nFz/DEX.WwZpHa75uKtze9kn9vW/zo4MX.mbhH2	f	2026-05-09 07:37:12.0636+00	2026-05-09 07:37:12.0636+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
7a866a5b-e250-4c17-93eb-16b1b1ac090d	nikhiljha	jhanikhil9@gmail.com	$2b$10$wTkSBrwve0vSfrgTX3gUlutLDokFVzkQvxugfUDt9/FkrbqXFOCn2	t	2026-05-08 11:44:02.924448+00	2026-05-08 11:49:45.38555+00	\N	0	\N	140	70	DemonSlayer	aries	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/56ae5e08078aadf132fb56625b25ccdf.jpg	sIE7w6VTfkNMbp7zUaVU	Another stubborn kid	Nikhil jha	1998-11-03		Male	1	t	[]	t	\N	\N	0
08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	ancdhebbws	nirupamsharma73@gmail.com	$2b$10$e5dEN0KxUYShamvVC2aB3uiInMBS9We/vgesKAAbLz0vIgOT.AgYS	t	2026-05-08 12:40:49.882651+00	2026-05-08 12:47:57.087518+00	\N	0	\N	100	70	\N	null	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/7a9b947bcbe67c02055f4bd345a5da40.jpg	\N	React developer 	Nirupam Sharma	2004-07-26	https://we.github.com/nipulsh	Male	1	t	[]	t	No Thoughts	2026-05-08 12:49:59.397375+00	0
a9cbb25f-2bb3-4d67-8cf6-4acf0067bc84	voidnulled	void@whitelabelssolutions.com	$2b$10$aeBEoHiJ.HtaDTYi6RxmSe/Nb2GVO2KuLmvlgcJxD.VVOLmxUkqWO	f	2026-05-08 15:44:58.004742+00	2026-05-08 15:44:58.004742+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
20416fdb-852e-4a5a-b047-677d14a47c44	newnewnew	new@gmail.com	$2b$10$JB6iPqXuzqeK2.uK4rNgjOt4gHY378TRCeCAOP/SO2hL8WyVhxju.	f	2026-05-08 15:46:40.903955+00	2026-05-08 15:46:40.903955+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
fefee755-45b5-4cc1-b870-60c6ca2d99a5	ankit	ankitbhati2005@gmail.com	$2b$10$7CVOqSFnVyAWPjbedFEo3eoiRaQxwl8sUKhSp44IZh2mjtxMUF87K	t	2026-05-08 15:22:40.466985+00	2026-05-09 12:21:25.995483+00	\N	0	\N	120	70	dark	null	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/c2c7ef761aa7e04dbdca9cbe939ac77d.jpg	sIE7w6VTfkNMbp7zUaVU	Yo yo hunny singh 	Ankit 	2000-01-10		Male	1	t	[]	t	On It	2026-05-09 12:25:43.988731+00	0
a44fc361-91c7-4c47-b215-4dd528ca71d1	mamata	mamata.behera8800@gmail.com	$2b$10$IsKdgHcRPD.P30k4qrKoreZBK1F0RptVzDQqKzWv0rAtonpsC/4Ty	t	2026-05-15 06:45:22.818245+00	2026-05-19 14:44:15.281975+00	\N	0	\N	31	0	\N	null	\N	\N	Extrovert, Kind and Growth Oriented	Swati	2006-08-08		Female	1	f	[{"id": 1488408568, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/300x300bb.jpg", "title": "Blinding Lights", "artist": "The Weeknd", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/b4/8f/17b48f9a-0b93-6bb8-fe1d-3a16623c2cfb/mzaf_9560252727299052414.plus.aac.p.m4a"}, {"id": 1658012467, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/a8/60/5f/a8605f98-0b93-da9e-76fe-e239fed1e38c/5059950896060.png/300x300bb.jpg", "title": "On Top", "artist": "Karan Aujla", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/5f/c4/71/5fc47157-642b-96b7-2ad8-498e23a17668/mzaf_16621531262746027612.plus.aac.p.m4a"}, {"id": 1687649562, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/dc/46/a9/dc46a9c9-794e-2d7a-1afb-97eb4ae0fff6/197188915704.jpg/300x300bb.jpg", "title": "Cheques", "artist": "Shubh", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5f/e9/8a/5fe98aa5-660a-2f91-b53d-558fdb9ef50b/mzaf_5845186979219129320.plus.aac.p.m4a"}, {"id": 1635085707, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a7/b3/80/a7b380b9-9e29-1642-566e-d1ca4b920886/196776912972.jpg/300x300bb.jpg", "title": "No Love", "artist": "Shubh", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/ce/d5/f5/ced5f5a3-0d78-6262-a00b-acf4c48bd231/mzaf_314082565532823013.plus.aac.p.m4a"}, {"id": 1440619218, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/70/31/00/7031001b-f918-6009-76c2-9db98d3ef811/11DMGIM02401.rgb.jpg/300x300bb.jpg", "title": "Love You Like A Love Song", "artist": "Selena Gomez & The Scene", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b3/3b/9e/b33b9ea5-85fc-45bb-8667-2af6915b0ce4/mzaf_8989224046963076708.plus.aac.p.m4a"}]	f	On It	2026-05-15 13:11:13.278756+00	0
e4ac17c0-e80b-4dab-878e-bd4c59cd1ac8	3psfv	parsaisoham@gmail.com	$2b$10$z67yvCPKNey9FTUQFSJUM..f/BWmcJxXqHi.YyeDlJjRdq.Ppb4M.	t	2026-05-15 06:26:00.735214+00	2026-05-19 12:24:38.503432+00	\N	0	\N	118	70	ocean	aquarius	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/380645eb52321eb78a0bc17e3ca36624.jpg	sIE7w6VTfkNMbp7zUaVU	Wip	Soham 	2000-01-14	Jakaja	Male	1	t	[]	t	No Thoughts	2026-05-19 12:24:00.307984+00	0
d93c5f5b-25d3-4e7b-8e4d-7afcbfc1c0cf	venuuu	pvenugopal0922@gmail.com	$2b$10$Vrklj19iScA/BF1byhiVAeANjs4LxoIcYC/OEveW7I5JJ8q2DX.PW	f	2026-05-20 19:59:03.799881+00	2026-05-20 19:59:03.799881+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
573ac182-4ab9-4ad7-bd6e-5b15437d7066	sr0710	swastik.sr29@gmail.com	$2b$10$eOOxkot6DirDhtBP5ZE6../f4Vd9HTLNZDH/q11/60lLLTDA/118W	t	2026-05-15 13:17:58.409805+00	2026-05-15 14:46:59.366635+00	\N	0	\N	100	70	light	cancer	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/0ce1c686d37e27f5bd89fb67b19ee0f7.jpg	\N	Testing	Swastik Rath	2006-06-29	M	Male	1	t	[{"id": 1702823583, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/aa/33/55/aa335541-9932-d73c-6b1e-62bd484fc83d/4547366642308.jpg/300x300bb.jpg", "title": "SPECIALZ", "artist": "King Gnu", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/b0/6a/a2/b06aa243-8ef5-3543-bd63-d313cd92d8e5/mzaf_8532414186904658024.plus.aac.p.m4a"}]	t	\N	\N	0
20e3d541-f336-4e5c-b959-d3c80a5d6325	titikshya	titipradhan04@gmail.com	$2b$10$a62AUHds5yWwtbLbFRtkZ.V45GlgCPxupzyQJx.GFEi7YCxoIh9Ly	t	2026-05-15 08:13:46.981624+00	2026-05-15 08:14:18.557625+00	\N	0	\N	30	0	forest	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
322104db-a6b5-4a7e-8271-9451182ef99b	venuuu22	venu587296@gmail.com	$2b$10$C2dUNCqEKHj4eqWv328zeObS/ms1WcVMELUf4kEVOaK.1.C5zPlLK	f	2026-05-20 20:00:04.417988+00	2026-05-20 20:00:04.417988+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
3ef3e217-199f-445b-a44d-2f9a935d3c00	aravindmuthiah23	aravindmuthiah23@gmail.com	$2b$10$6dGV96YJyZ1MOoTGiCMX0OPpKDqMnROvRHMkay7im/XtSrDVSbfl2	t	2026-05-09 13:14:49.147256+00	2026-05-09 13:15:18.175721+00	\N	0	\N	30	0	dark	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
a3deaca4-2c97-410b-957e-7f1e555e41fa	boibhav17	boibhavdey17@gmail.com	$2b$10$jGLu2QsQaDJWToXcXXeOd.4W7zCtZ8DP43vCRWQ7cD5dHTekX1Nn2	t	2026-05-13 08:14:10.205986+00	2026-05-13 08:14:40.085102+00	\N	0	\N	30	0	dark	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	aritra	royaritra738@gmail.com	$2b$10$dbc9n5b/c9vxh372WsUqu.mlYwORyZmGgP19BAVlD5rdjpcc6/2cO	t	2026-05-09 11:56:06.957808+00	2026-05-09 12:12:30.716159+00	\N	0	\N	135	70	dark	scorpio	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/a7b8232b63baba2161af61d7cf77365f.jpg	sIE7w6VTfkNMbp7zUaVU	......:|	Aritra	2000-11-03		Male	1	t	[{"id": 1710464681, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/b4/ab/c3/b4abc3c3-bd25-b8cb-0011-4311e3f9497e/197189936111.jpg/300x300bb.jpg", "title": "Dil Mere", "artist": "The Local Train", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/c7/e2/4b/c7e24b55-18f0-7385-a769-1959fcb415a4/mzaf_16866152385825294898.plus.aac.p.m4a"}, {"id": 1878360173, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/49/80/84/4980847c-227b-260f-017f-f1e6df720a86/8721416354540.jpg/300x300bb.jpg", "title": "Main tera ho gaya", "artist": "Karneast, riya & Simon Vikram", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/92/ce/b8/92ceb86b-7913-4646-246e-8485759c69ee/mzaf_7989085800871353693.plus.aac.p.m4a"}, {"id": 1710464678, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/b4/ab/c3/b4abc3c3-bd25-b8cb-0011-4311e3f9497e/197189936111.jpg/300x300bb.jpg", "title": "Choo Lo", "artist": "The Local Train", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/74/b6/1a/74b61adc-568e-2657-6e6e-b7cbc23b0480/mzaf_3124165524510611311.plus.aac.p.m4a"}, {"id": 1642595275, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/46/90/a8/4690a854-48c8-e17b-f182-1fa2453ad807/artwork.jpg/300x300bb.jpg", "title": "Upo", "artist": "Hatirpool Sessions", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/08/d2/6d/08d26d30-f7d4-9a5f-741c-b74c45cf2f02/mzaf_16857565983818305542.plus.aac.p.m4a"}, {"id": 1837368155, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4d/8f/f3/4d8ff378-a4fb-6dc4-f3f5-c6b6d73216e9/25UM1IM34721.rgb.jpg/300x300bb.jpg", "title": "Long Distance Love | Coke Studio Bangla", "artist": "Ankan Kumar, Modernotaku & Shuvendu Das Shuvo", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/82/5c/cb/825ccb8e-70f3-cdb7-0766-d78bf6f41c93/mzaf_13894586651827076192.plus.aac.p.m4a"}]	t	Low Battery	2026-05-09 11:57:49.141324+00	0
9cb52fcb-1b3e-48fa-9a5f-fc9de8c6a773	sameer	sameerahmedg666@gmail.com	$2b$10$UtLa5DZXo98QSo8yZl/lDet/CmVupYGYfUhUWRmlbW.SWUlV/o/aq	t	2026-05-09 15:17:07.467634+00	2026-05-09 15:17:27.309809+00	\N	0	\N	30	0	vibrantDark	\N	\N	sIE7w6VTfkNMbp7zUaVU	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
f0a48f0c-1e9d-45b4-a249-300bf98b7fa6	booooooom	sameerahmedg66@gmail.com	$2b$10$gQvSrHC0g7oBTwTBmmpxou8gRo8r3lUB93c5.0IWc1muvZilnJemC	f	2026-05-09 16:59:12.302233+00	2026-05-09 16:59:12.302233+00	\N	0	\N	30	0	FanArtGojo	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
7a3f6c05-24ce-4b4e-975c-d70e7867d818	diwakarbisht225bisht	diwakarbisht225@gmail.com	$2b$10$/6islWQQGhOCwi8w50SpDuaCFTO13tQSnYcYsRIOYc9ux0KRRkPYm	f	2026-05-11 06:30:12.208355+00	2026-05-11 06:44:45.983106+00	\N	0	\N	30	0	dark	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[{"id": 1578903792, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/86/31/60/863160ca-fa32-0a26-0da5-18688e8793f8/cover.jpg/300x300bb.jpg", "title": "Mashup Garhwali, Kumauni, Himanchali", "artist": "Priyanka Meher", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/44/12/45/441245d4-0723-2f04-b018-7914483014dc/mzaf_1067712444906710777.plus.aac.p.m4a"}]	f	\N	\N	0
236ea5fd-d13e-4273-b70d-f8e06e32f1b4	robin7	santoshjitu1980@gmail.com	$2b$10$SEOa/heAVjb5ZGstaTChqOcioTfyCbYtSuPV8Ke40iNlvr3xPQT52	t	2026-05-10 09:41:48.431429+00	2026-05-10 09:42:32.698433+00	\N	0	\N	30	0	dark	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
f11b0807-16f0-46a8-894a-075fa92a1204	developer	int.variable02@gmail.com	$2b$10$43heoczWdXdqeWoaR3Ey2uo9Xt34CnN9t9y8eTNEcn6Ru4fCKHmRy	f	2026-05-10 14:01:59.033903+00	2026-05-10 14:01:59.033903+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
6c14069a-c7af-4acb-b485-a49550b624f1	diwakarbisht25	diwakabisht225@gmail.com	$2b$10$krqUMaxAlr..C.k8jsNbDOAF7zvr4gOOVDdyty49LSKiGmvujinXC	f	2026-05-11 06:29:43.507418+00	2026-05-11 06:29:43.507418+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
464063c3-9b17-486c-8cb6-5c0ce2ebac2d	akr123	aayushkumar5777@gmail.com	$2b$10$WYYRP/X1XFhMlYfogyemL.TszztyH.v7l/OgBQMXFoVWCBGl8aT/m	t	2026-05-12 03:40:24.35563+00	2026-05-12 12:37:44.864309+00	\N	0	\N	30	0	ocean	\N	\N	sIE7w6VTfkNMbp7zUaVU	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
2c575cfe-fdb1-4252-8b4a-dc44685b014c	adityasiv27	adityaxia9237@gmail.com	$2b$10$ju4J/jMOwivEQ3Zw0cLwqO8HXQF145e/HmUZ42Cqv1sp6NFUuq6gC	t	2026-05-11 12:07:36.923347+00	2026-05-11 12:08:07.283648+00	\N	0	\N	30	0	DemonSlayer	\N	\N	sIE7w6VTfkNMbp7zUaVU	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
f683c1a4-f252-40b0-bebf-26e1c85e49e8	beasto_gawd	myselfadarsh01@gmail.com	$2b$10$oNyykCMJOo8tzvwLjB7Vcelfyw/7pX5QMIRxqcSxe4huuJKQ6VwFG	f	2026-05-13 03:54:49.606011+00	2026-05-13 03:54:49.606011+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
c5633ca7-a98e-416b-b401-ac3e3b6f3611	bhamini	bhaminitiwari665@gmail.com	$2b$10$YQSo/NY9iCHFs8uExVyxzO5buSup0UJSGPG4uHsvnZobIpn3Vlrw.	t	2026-05-12 06:11:30.515466+00	2026-05-12 06:12:47.08035+00	\N	0	\N	30	0	dark	\N	\N	sIE7w6VTfkNMbp7zUaVU	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
ec34bde8-4031-448c-867d-fdec468b7f7d	shreyan	shreyanofficial25@gmail.com	$2b$10$kkr11msEzar9YqhVEpyySuZTEF7M5nwRUQ6bEtprPZqkMc.jGtlmC	t	2026-05-09 13:28:24.93851+00	2026-05-09 13:29:03.089124+00	\N	0	\N	68	0	ocean	\N	\N	sIE7w6VTfkNMbp7zUaVU	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
26e1a1e0-203b-4f46-90d6-91077cf2ebb2	zreelesmi	sreelekshmikss5@gmail.com	$2b$10$yfAu2u77VptDlccSmYXu7uvKNn6PQXSWL6mitCTmbxhakSu2x1x8G	f	2026-05-12 07:56:16.283783+00	2026-05-12 07:56:16.283783+00	\N	0	\N	30	0	ocean	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
6b39124d-34b3-428b-be6e-719a36b89fba	aurameter.in	humourhive9@gmail.com	$2b$10$yosEkLD6UQjlGUyKb1hQAeVyoFGdRNzaAorTifC4VzwUtfjJGI97.	f	2026-05-13 03:55:52.27663+00	2026-05-13 03:55:52.27663+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
176033e8-b3ae-4a69-ae7b-65070790a480	aurameter	app.aurameter@gmail.com	$2b$10$yPjaTEqHkrCcWhjRtcUmrulICbdctnKOcpLFdKlFKNs9W9IlppDyu	f	2026-05-11 11:40:50.392641+00	2026-05-11 14:19:28.35808+00	\N	0	\N	30	0	Ben10Theme	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
9438b52c-3b98-4f6a-ad3d-4544f04706b9	aura_01	thenewwaynewlifecorpus@gmail.com	$2b$10$soZ6HgKpNweJpJ2L7ArEBOGg4xWGfQrBpp5AQW.1AfMPAu7VhDFfe	f	2026-05-12 10:41:57.135083+00	2026-05-12 10:41:57.135083+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
7a7a9803-a01a-4c4f-b8db-7a6faf519e71	shreya	shreya@gmail.com	$2b$10$QwojklC05QoTiMPcxTxPTeF/ujE2Ya5YpBimSfjNF/jbJle1Av94.	f	2026-05-12 12:03:18.903475+00	2026-05-12 12:03:18.903475+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
c5c33302-4369-49ae-bc34-b4aa65def5a1	anno_hamdiano	hazzytaypre@gmail.com	$2b$10$bOL.C0dea.nI.a0ODzy8MuD2JKub746c2QC95CjBy/bg/9VEmrwWi	t	2026-05-11 11:32:33.148708+00	2026-05-12 12:13:31.603737+00	\N	0	\N	30	0	dark	null	\N	\N	Ntg	M	2005-01-26	Guu	Male	1	f	[]	f	On It	2026-05-12 12:12:54.103672+00	0
7b6df3fd-e8ee-4201-9155-a62ff3d5d11c	swati	swatishreela588@gmail.com	$2b$10$5PDQJe/3cOsZgLeON6Dstu2TP.tOgsoytwahXQxTtkcLnQvedMw1a	t	2026-05-15 06:41:26.539835+00	2026-05-15 06:42:13.851247+00	\N	0	\N	30	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	1	f	[]	f	\N	\N	0
d9549f44-0bd6-44be-8dc6-c8272f3ddea4	pallavi	info.pallavirajpurohit@gmail.com	$2b$10$vzqHoYCXEP0dCNyinuPEfef0zWoLB8zVpm1S.E.6o23cLJYid7Nne	t	2026-05-10 07:03:21.216205+00	2026-05-10 07:16:17.451404+00	\N	0	\N	32	0	forest	\N	\N	sIE7w6VTfkNMbp7zUaVU	\N	\N	\N	\N	\N	1	f	[{"id": 1146195725, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/bb/45/68/bb4568f3-68cd-619d-fbcb-4e179916545d/BlondCover-Final.jpg/300x300bb.jpg", "title": "White Ferrari", "artist": "Frank Ocean", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/86/5a/d1/865ad14f-f77e-3b9c-b108-930af566864d/mzaf_286153466120868843.plus.aac.p.m4a"}]	f	\N	\N	0
8c5fd867-b035-4eb1-bb71-54e661861dfd	sandeep	ambashtasandeep@gmail.com	$2b$10$jThLhAHoVIjdnhEZQTwN4uU/PHvQFU8Z3jBo0thSLp5w5pcp/LZHe	f	2026-05-18 16:21:07.15964+00	2026-05-18 16:38:10.697575+00	\N	0	\N	30	0	DemonSlayer	pisces	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/50a696af8da83c686597ded3d2feff69.jpg	sIE7w6VTfkNMbp7zUaVU	In my own element 	Sandeep Ambashta 	2005-01-27	www.qikkspace.com	Male	1	f	[{"id": 1762198508, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c5/54/3b/c5543b7a-68df-43c7-af19-de5bb20480ce/cover.jpg/300x300bb.jpg", "title": "Soyi Nahi", "artist": "Seedhe Maut", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/9b/b7/da/9bb7dad2-ee4f-ba80-dcab-fe1c0691ff63/mzaf_5758792615098741514.plus.aac.p.m4a"}]	f	\N	\N	0
8748e7ec-fe14-49d2-97ad-418da6bacebf	piyushjha	piyushjha9001@gmail.com	$2b$10$pbbQ5G3.81Drr5A.Wun9k.SgAZoJ/bahUwOtYwQO14MDHZPhdvu96	t	2026-05-18 15:51:25.068869+00	2026-05-19 08:48:42.976064+00	\N	0	\N	115	70	galaxy	virgo	https://aurameter-s3-prod.s3.ap-south-1.amazonaws.com/profile/be1f260de1c2445318a37c5edf02a33b.jpg	\N	It's Hero time	Piyush Jha	2004-08-29	Www.qikkspace.com	Male	1	t	[{"id": 1538003843, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/300x300bb.jpg", "title": "Levitating", "artist": "Dua Lipa", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a"}, {"id": 1750307079, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f6/15/d0/f615d0ab-e0c4-575d-907e-1cc084642357/24UMGIM61704.rgb.jpg/300x300bb.jpg", "title": "Taste", "artist": "Sabrina Carpenter", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/26/57/a6/2657a620-c596-e0e4-efa2-e814f3572d1c/mzaf_5475540510703120797.plus.aac.p.m4a"}, {"id": 1534551264, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/25/01/97/250197ec-0724-b228-4bb6-b2763b1892f7/8718857799191.png/300x300bb.jpg", "title": "Tu Meri", "artist": "Vishal Dadlani & Vishal & Shekhar", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/62/c2/b8/62c2b8ec-d243-ee71-22c2-cf4999890c97/mzaf_11024718917293775630.plus.aac.p.m4a"}, {"id": 1829591983, "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/06/bd/e1/06bde161-335b-87fa-650a-f0d04bd9f55d/5021732889621.jpg/300x300bb.jpg", "title": "For A Reason", "artist": "Karan Aujla & Ikky", "streamUrl": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/88/d0/c2/88d0c267-2901-be7d-2eaf-e816e8848135/mzaf_1951286537933087556.plus.aac.p.m4a"}]	t	Dead Inside	2026-05-18 16:08:30.360403+00	0
\.


--
-- Data for Name: verification_codes; Type: TABLE DATA; Schema: public; Owner: aurameter_user
--

COPY public.verification_codes (id, user_id, code, purpose, expires_at, created_at) FROM stdin;
efc9153c-b165-44b3-aa8f-56a55e06b3f1	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	343397	signup	2026-05-08 12:50:49.884	2026-05-08 12:40:49.884544
030d3150-fc67-482f-90d2-7d5ad1e634d9	08e6d8e6-be60-4107-8ff2-cc9ef05ab6f5	820648	update_email	2026-05-08 12:56:41.343	2026-05-08 12:46:41.34368
b1fc998a-2699-4a38-97f4-f6818ebb7cec	fefee755-45b5-4cc1-b870-60c6ca2d99a5	743851	signup	2026-05-08 15:32:40.482	2026-05-08 15:22:40.483816
c3ed48d7-b57d-4274-85bd-27e629218e12	a9cbb25f-2bb3-4d67-8cf6-4acf0067bc84	248041	signup	2026-05-08 15:54:58.006	2026-05-08 15:44:58.006875
bf82204a-33be-4f4a-95d6-7a11fbe5149c	20416fdb-852e-4a5a-b047-677d14a47c44	682219	signup	2026-05-08 15:56:40.905	2026-05-08 15:46:40.905564
eb626207-461b-4494-99b7-3ac9c10f601a	cce2b6cb-47e4-42a1-bd11-94883f72c6de	181686	signup	2026-05-08 16:10:09.404	2026-05-08 16:00:09.404884
1507711a-bbbd-45ef-897a-1dbec2715a75	564e1128-ac49-4235-9d61-6e00ca6e2835	253275	signup	2026-05-09 07:47:12.078	2026-05-09 07:37:12.078749
9a213061-33c1-4d18-9368-823cf6172d51	bfdd92e9-bcce-4ef0-8c50-3e446fd5f62b	368277	update_email	2026-05-09 12:08:03.554	2026-05-09 11:58:03.554295
a21cc6da-3e2f-4aeb-a2d1-eb300d95404d	fefee755-45b5-4cc1-b870-60c6ca2d99a5	820182	update_email	2026-05-09 12:31:05.579	2026-05-09 12:21:05.57927
992250b3-bdd1-4818-8c4c-bc25291ec255	f0a48f0c-1e9d-45b4-a249-300bf98b7fa6	544372	signup	2026-05-09 17:09:12.303	2026-05-09 16:59:12.303945
b9c06ece-2613-4a90-804e-6879dcb88508	f11b0807-16f0-46a8-894a-075fa92a1204	117625	signup	2026-05-10 14:11:59.044	2026-05-10 14:01:59.044581
57e1be94-0377-4b40-8e2f-a796f9e1defa	6c14069a-c7af-4acb-b485-a49550b624f1	827675	signup	2026-05-11 06:39:43.523	2026-05-11 06:29:43.523902
7c2fec1f-9aff-41e8-a0af-26be0e3b0bbd	7a3f6c05-24ce-4b4e-975c-d70e7867d818	437689	signup	2026-05-11 06:40:12.213	2026-05-11 06:30:12.213665
cc6c4937-b204-4a75-8cd7-3a9a4d48909f	176033e8-b3ae-4a69-ae7b-65070790a480	899868	signup	2026-05-11 11:50:50.394	2026-05-11 11:40:50.394586
920f2092-de87-4ae5-9f00-03c7a262933c	26e1a1e0-203b-4f46-90d6-91077cf2ebb2	864140	signup	2026-05-12 08:06:16.301	2026-05-12 07:56:16.301604
b5d7b3cc-7042-40c4-b7bf-e096f247ec81	9438b52c-3b98-4f6a-ad3d-4544f04706b9	279636	signup	2026-05-12 10:51:57.145	2026-05-12 10:41:57.145883
8d636303-eef7-4da4-90b0-c0ec40b4e7bf	7a7a9803-a01a-4c4f-b8db-7a6faf519e71	522520	signup	2026-05-12 12:13:18.912	2026-05-12 12:03:18.912615
06576ffe-e922-41d5-9e60-53d1b118fba2	f683c1a4-f252-40b0-bebf-26e1c85e49e8	758387	signup	2026-05-13 04:04:49.617	2026-05-13 03:54:49.617756
2608cdc4-a708-4d54-878f-6e302e9003b8	6b39124d-34b3-428b-be6e-719a36b89fba	367837	signup	2026-05-13 04:05:52.278	2026-05-13 03:55:52.278302
51324047-4bd3-4c9c-9e62-ab6bf0fd3782	573ac182-4ab9-4ad7-bd6e-5b15437d7066	881627	signup	2026-05-15 13:27:58.414	2026-05-15 13:17:58.41506
70069682-629a-4b03-8083-e34a71cbcd05	573ac182-4ab9-4ad7-bd6e-5b15437d7066	480318	update_email	2026-05-15 14:44:52.311	2026-05-15 14:34:52.311145
b269b9c0-cdcb-42d1-a6de-318b680e5c42	8c5fd867-b035-4eb1-bb71-54e661861dfd	221843	signup	2026-05-18 16:31:07.163	2026-05-18 16:21:07.163309
1468001a-df0c-45fb-8913-79f1d565e3de	8c5fd867-b035-4eb1-bb71-54e661861dfd	800084	update_email	2026-05-18 16:37:59.036	2026-05-18 16:27:59.036263
67c1243d-3346-4b3e-92fd-1159cad7fe12	d93c5f5b-25d3-4e7b-8e4d-7afcbfc1c0cf	171664	signup	2026-05-20 20:09:03.815	2026-05-20 19:59:03.815987
5d0a78b9-e414-4ed9-ae5e-8bc662b28986	322104db-a6b5-4a7e-8271-9451182ef99b	824082	signup	2026-05-20 20:10:04.42	2026-05-20 20:00:04.421094
\.


--
-- Name: aura_chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aurameter_user
--

SELECT pg_catalog.setval('public.aura_chat_messages_id_seq', 52, true);


--
-- Name: aura_chat_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aurameter_user
--

SELECT pg_catalog.setval('public.aura_chat_users_id_seq', 8, true);


--
-- Name: fcm_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aurameter_user
--

SELECT pg_catalog.setval('public.fcm_tokens_id_seq', 124, true);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aurameter_user
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 179, true);


--
-- Name: aura_chat_messages aura_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_chat_messages
    ADD CONSTRAINT aura_chat_messages_pkey PRIMARY KEY (id);


--
-- Name: aura_chat_users aura_chat_users_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_chat_users
    ADD CONSTRAINT aura_chat_users_pkey PRIMARY KEY (id);


--
-- Name: aura_chat_users aura_chat_users_user_id_key; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_chat_users
    ADD CONSTRAINT aura_chat_users_user_id_key UNIQUE (user_id);


--
-- Name: aura_transactions aura_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_transactions
    ADD CONSTRAINT aura_transactions_pkey PRIMARY KEY (id);


--
-- Name: chat_reads chat_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.chat_reads
    ADD CONSTRAINT chat_reads_pkey PRIMARY KEY (chat_id, user_id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: connections connections_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_pkey PRIMARY KEY (id);


--
-- Name: connections connections_user1_id_user2_id_key; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_user1_id_user2_id_key UNIQUE (user1_id, user2_id);


--
-- Name: fcm_tokens fcm_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.fcm_tokens
    ADD CONSTRAINT fcm_tokens_pkey PRIMARY KEY (id);


--
-- Name: followers followers_follower_id_following_id_key; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_follower_id_following_id_key UNIQUE (follower_id, following_id);


--
-- Name: followers followers_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT followers_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: story_auras story_auras_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_auras
    ADD CONSTRAINT story_auras_pkey PRIMARY KEY (id);


--
-- Name: story_auras story_auras_story_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_auras
    ADD CONSTRAINT story_auras_story_id_user_id_key UNIQUE (story_id, user_id);


--
-- Name: story_comment_likes story_comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_comment_likes
    ADD CONSTRAINT story_comment_likes_pkey PRIMARY KEY (comment_id, user_id);


--
-- Name: story_comments story_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_comments
    ADD CONSTRAINT story_comments_pkey PRIMARY KEY (id);


--
-- Name: story_views story_views_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_pkey PRIMARY KEY (id);


--
-- Name: story_views story_views_story_id_viewer_id_key; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_story_id_viewer_id_key UNIQUE (story_id, viewer_id);


--
-- Name: streaks streaks_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT streaks_pkey PRIMARY KEY (id);


--
-- Name: streaks streaks_user1_id_user2_id_type_key; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT streaks_user1_id_user2_id_type_key UNIQUE (user1_id, user2_id, type);


--
-- Name: messages unique_sender_local; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT unique_sender_local UNIQUE (sender_id, local_id);


--
-- Name: fcm_tokens unique_user_id; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.fcm_tokens
    ADD CONSTRAINT unique_user_id UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: verification_codes verification_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_pkey PRIMARY KEY (id);


--
-- Name: idx_aura_chat_user_id_id; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_aura_chat_user_id_id ON public.aura_chat_messages USING btree (user_id, id DESC);


--
-- Name: idx_aura_receiver; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_aura_receiver ON public.aura_transactions USING btree (receiver_id);


--
-- Name: idx_aura_receiver_created; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_aura_receiver_created ON public.aura_transactions USING btree (receiver_id, created_at DESC);


--
-- Name: idx_aura_sender; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_aura_sender ON public.aura_transactions USING btree (sender_id);


--
-- Name: idx_chat_reads_user; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_chat_reads_user ON public.chat_reads USING btree (user_id, chat_id);


--
-- Name: idx_chats_active; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_chats_active ON public.chats USING btree (is_active);


--
-- Name: idx_chats_last_message; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_chats_last_message ON public.chats USING btree (last_message_at DESC);


--
-- Name: idx_chats_last_message_type; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_chats_last_message_type ON public.chats USING btree (last_message_type);


--
-- Name: idx_chats_user1; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_chats_user1 ON public.chats USING btree (user1);


--
-- Name: idx_chats_user2; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_chats_user2 ON public.chats USING btree (user2);


--
-- Name: idx_comment_likes_comment; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_comment_likes_comment ON public.story_comment_likes USING btree (comment_id);


--
-- Name: idx_comment_likes_user; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_comment_likes_user ON public.story_comment_likes USING btree (user_id);


--
-- Name: idx_connections_user1; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_connections_user1 ON public.connections USING btree (user1_id);


--
-- Name: idx_connections_user2; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_connections_user2 ON public.connections USING btree (user2_id);


--
-- Name: idx_fcm_tokens_user_id; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_fcm_tokens_user_id ON public.fcm_tokens USING btree (user_id);


--
-- Name: idx_followers_follower; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_followers_follower ON public.followers USING btree (follower_id);


--
-- Name: idx_followers_following; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_followers_following ON public.followers USING btree (following_id);


--
-- Name: idx_followers_pair; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE UNIQUE INDEX idx_followers_pair ON public.followers USING btree (follower_id, following_id);


--
-- Name: idx_messages_chat_created; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_messages_chat_created ON public.messages USING btree (chat_id, created_at DESC);


--
-- Name: idx_messages_chat_cursor; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_messages_chat_cursor ON public.messages USING btree (chat_id, created_at DESC, id DESC) WHERE (status = 'sent'::text);


--
-- Name: idx_messages_chat_seq; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_messages_chat_seq ON public.messages USING btree (chat_id, seq);


--
-- Name: idx_messages_chat_seq_desc; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_messages_chat_seq_desc ON public.messages USING btree (chat_id, seq DESC);


--
-- Name: idx_messages_chat_sync_asc; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_messages_chat_sync_asc ON public.messages USING btree (chat_id, created_at, id) WHERE (status = 'sent'::text);


--
-- Name: idx_notifications_actor; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_notifications_actor ON public.notifications USING btree (actor_id);


--
-- Name: idx_notifications_recipient_created; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_notifications_recipient_created ON public.notifications USING btree (recipient_id, created_at DESC);


--
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (recipient_id) WHERE (is_read = false);


--
-- Name: idx_stories_gemini_aura; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_stories_gemini_aura ON public.stories USING btree (geminiaura);


--
-- Name: idx_stories_gemini_comment; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_stories_gemini_comment ON public.stories USING btree (geminicomment);


--
-- Name: idx_stories_local_id; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_stories_local_id ON public.stories USING btree (local_id);


--
-- Name: idx_stories_pending_only; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_stories_pending_only ON public.stories USING btree (added_at) WHERE ((status)::text = 'PENDING'::text);


--
-- Name: idx_stories_status; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_stories_status ON public.stories USING btree (status);


--
-- Name: idx_stories_user_added; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_stories_user_added ON public.stories USING btree (user_id, added_at);


--
-- Name: idx_stories_user_created; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_stories_user_created ON public.stories USING btree (user_id, created_at);


--
-- Name: idx_story_auras_sent_on; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_auras_sent_on ON public.story_auras USING btree (sent_on DESC);


--
-- Name: idx_story_auras_story_id; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_auras_story_id ON public.story_auras USING btree (story_id);


--
-- Name: idx_story_auras_user_id; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_auras_user_id ON public.story_auras USING btree (user_id);


--
-- Name: idx_story_comments_story_created; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_comments_story_created ON public.story_comments USING btree (story_id, created_at DESC);


--
-- Name: idx_story_comments_story_created_id; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_comments_story_created_id ON public.story_comments USING btree (story_id, created_at DESC, id DESC);


--
-- Name: idx_story_comments_user; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_comments_user ON public.story_comments USING btree (user_id);


--
-- Name: idx_story_views_story; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_views_story ON public.story_views USING btree (story_id);


--
-- Name: idx_story_views_story_user; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_views_story_user ON public.story_views USING btree (story_id, viewer_id);


--
-- Name: idx_story_views_user; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_views_user ON public.story_views USING btree (viewer_id);


--
-- Name: idx_story_views_user_time; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_story_views_user_time ON public.story_views USING btree (viewer_id, viewed_at DESC);


--
-- Name: idx_streaks_type; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_streaks_type ON public.streaks USING btree (type);


--
-- Name: idx_streaks_user1; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_streaks_user1 ON public.streaks USING btree (user1_id);


--
-- Name: idx_streaks_user2; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_streaks_user2 ON public.streaks USING btree (user2_id);


--
-- Name: idx_users_aura_desc; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_users_aura_desc ON public.users USING btree (aura DESC);


--
-- Name: idx_users_campus_aura_desc; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_users_campus_aura_desc ON public.users USING btree (campus_id, aura DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE UNIQUE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE UNIQUE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: idx_verification_codes_code; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_verification_codes_code ON public.verification_codes USING btree (code);


--
-- Name: idx_verification_codes_user_id; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX idx_verification_codes_user_id ON public.verification_codes USING btree (user_id);


--
-- Name: refresh_tokens_token_idx; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE INDEX refresh_tokens_token_idx ON public.refresh_tokens USING btree (token);


--
-- Name: refresh_tokens_user_device_unique; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE UNIQUE INDEX refresh_tokens_user_device_unique ON public.refresh_tokens USING btree (user_id, device_id);


--
-- Name: unique_chat_pair; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE UNIQUE INDEX unique_chat_pair ON public.chats USING btree (LEAST(user1, user2), GREATEST(user1, user2));


--
-- Name: unique_chat_seq; Type: INDEX; Schema: public; Owner: aurameter_user
--

CREATE UNIQUE INDEX unique_chat_seq ON public.messages USING btree (chat_id, seq);


--
-- Name: aura_chat_messages aura_chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_chat_messages
    ADD CONSTRAINT aura_chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: aura_chat_users aura_chat_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_chat_users
    ADD CONSTRAINT aura_chat_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_reads chat_reads_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.chat_reads
    ADD CONSTRAINT chat_reads_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_reads chat_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.chat_reads
    ADD CONSTRAINT chat_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chats chats_last_message_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_last_message_by_fkey FOREIGN KEY (last_message_by) REFERENCES public.users(id);


--
-- Name: chats chats_user1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user1_fkey FOREIGN KEY (user1) REFERENCES public.users(id);


--
-- Name: chats chats_user2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user2_fkey FOREIGN KEY (user2) REFERENCES public.users(id);


--
-- Name: connections connections_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: connections connections_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.connections
    ADD CONSTRAINT connections_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: fcm_tokens fcm_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.fcm_tokens
    ADD CONSTRAINT fcm_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_comment_likes fk_comment; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_comment_likes
    ADD CONSTRAINT fk_comment FOREIGN KEY (comment_id) REFERENCES public.story_comments(id) ON DELETE CASCADE;


--
-- Name: followers fk_follower; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT fk_follower FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: followers fk_following; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.followers
    ADD CONSTRAINT fk_following FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: aura_transactions fk_receiver; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_transactions
    ADD CONSTRAINT fk_receiver FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: aura_transactions fk_sender; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.aura_transactions
    ADD CONSTRAINT fk_sender FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: story_comments fk_story; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_comments
    ADD CONSTRAINT fk_story FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: stories fk_story_user; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT fk_story_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_comments fk_user; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_comments
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_comment_likes fk_user_like; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_comment_likes
    ADD CONSTRAINT fk_user_like FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: messages messages_replying_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_replying_to_fkey FOREIGN KEY (replying_to) REFERENCES public.messages(id) ON DELETE SET NULL;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_auras story_auras_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_auras
    ADD CONSTRAINT story_auras_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: story_auras story_auras_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_auras
    ADD CONSTRAINT story_auras_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: story_views story_views_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: story_views story_views_viewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.story_views
    ADD CONSTRAINT story_views_viewer_id_fkey FOREIGN KEY (viewer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: streaks streaks_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT streaks_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: streaks streaks_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.streaks
    ADD CONSTRAINT streaks_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: verification_codes verification_codes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aurameter_user
--

ALTER TABLE ONLY public.verification_codes
    ADD CONSTRAINT verification_codes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict rxqhh11meS2ZL5m8Ep7pidb4puxnMvkEIWh8rI43vC8wYx6vu3z92qpTqAptNmC

