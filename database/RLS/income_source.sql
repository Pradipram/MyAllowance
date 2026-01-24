alter policy "Users can manage their own income sources"
on "public"."income_sources"
to public
using (
  (auth.uid() = user_id)
);