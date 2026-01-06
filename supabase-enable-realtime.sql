-- Enable realtime for transactions table
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- Enable realtime for categories table (optional, for future enhancements)
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
