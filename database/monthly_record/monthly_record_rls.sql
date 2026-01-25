alter policy "Users can manage their own monthly records"
on "public"."monthly_records"
to public
using (
  (auth.uid() = user_id)
);