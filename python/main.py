import pandas as pd

# Try different encodings - latin-1 can decode any byte sequence
df = pd.read_csv('plants_formatted.csv', encoding='latin-1')

# Select only the columns we need
df_output = df[['Common Name', 'Scientific Name']].copy()

# Fill empty or null Common Name with Scientific Name
df_output['Common Name'] = df_output['Common Name'].fillna(df_output['Scientific Name'])
# Also handle empty strings
df_output.loc[df_output['Common Name'].str.strip() == '', 'Common Name'] = df_output.loc[df_output['Common Name'].str.strip() == '', 'Scientific Name']

df_output.to_csv('plants_names.csv', index=False)