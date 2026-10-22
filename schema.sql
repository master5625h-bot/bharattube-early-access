create extension if not exists pgcrypto;
create table if not exists signups(id bigint generated always as identity primary key,name text not null check(length(name) between 1 and 80),email text not null unique check(email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email)<=120),created_at timestamptz default now());
alter table signups enable row level security;
create table if not exists admin_cfg(k text primary key,v text);
alter table admin_cfg enable row level security;
create or replace function register(p_name text,p_email text) returns bigint language plpgsql security definer set search_path=public as $$
declare r bigint; begin
 insert into signups(name,email) values(trim(p_name),lower(trim(p_email))) on conflict(email) do nothing returning id into r;
 if r is null then select id into r from signups where email=lower(trim(p_email)); end if; return r; end $$;
create or replace function admin_list(p_pass text) returns setof signups language plpgsql security definer set search_path=public as $$
begin if not exists(select 1 from admin_cfg where k='hash' and v=crypt(p_pass,v)) then raise exception 'denied' using errcode='28000'; end if;
 return query select * from signups order by id; end $$;
revoke all on function register(text,text),admin_list(text) from public;
grant execute on function register(text,text),admin_list(text) to anon;
