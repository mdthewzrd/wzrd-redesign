---
name: data-analysis
description: Data analysis, statistics, visualization, and data processing
category: data
priority: P1
tags: [data, analysis, statistics, visualization, pandas]
subskills:
  - statistical-analysis
  - data-visualization
  - data-processing
  - exploratory-analysis
---

# Data Analysis Skill

## Purpose
Analyze data, extract insights, visualize trends, and make data-driven decisions.

## Core Principle
**"Data without analysis is just numbers. Analysis without insight is just math."**

## Data Processing

### Python with pandas
```python
import pandas as pd
import numpy as np

# Load data
df = pd.read_csv('data.csv')
df = pd.read_json('data.json')
df = pd.read_excel('data.xlsx')

# Quick overview
print(df.head())           # First 5 rows
print(df.info())           # Data types, non-null counts
print(df.describe())       # Statistical summary
print(df.shape)            # (rows, columns)

# Column selection
df['column_name']          # Single column as Series
df[['col1', 'col2']]       # Multiple columns as DataFrame
df.filter(regex='pattern') # Columns matching regex

# Filtering
df[df['age'] > 30]                         # Single condition
df[(df['age'] > 25) & (df['city'] == 'NY')] # Multiple conditions
df.query('age > 25 and city == "NY"')      # Query syntax

# Sorting
df.sort_values('column_name')              # Ascending
df.sort_values('column_name', ascending=False)
df.sort_values(['col1', 'col2'])           # Multiple columns

# Grouping and aggregation
df.groupby('category')['value'].mean()
df.groupby('category').agg({
    'value': ['mean', 'median', 'std'],
    'count': 'sum'
})

# Handling missing data
df.dropna()                    # Drop rows with any null
df.fillna(0)                   # Fill with value
df.fillna(df.mean())           # Fill with column mean
df['col'].fillna(df['col'].mode()[0])  # Fill with mode

# Data transformation
df['new_col'] = df['col1'] + df['col2']
df['normalized'] = (df['value'] - df['value'].mean()) / df['value'].std()
df['category'] = pd.cut(df['age'], bins=[0, 18, 65, 100], labels=['young', 'adult', 'senior'])

# Apply functions
df['value'].apply(lambda x: x * 2)
df.apply(lambda row: row['a'] + row['b'], axis=1)

# Merging
pd.merge(df1, df2, on='key')                    # Inner join
pd.merge(df1, df2, on='key', how='left')        # Left join
pd.concat([df1, df2])                           # Stack vertically
```

## Statistical Analysis

### Descriptive Statistics
```python
# Central tendency
df['column'].mean()      # Arithmetic mean
df['column'].median()    # Median
df['column'].mode()      # Mode
df['column'].quantile(0.25)  # 25th percentile

# Dispersion
df['column'].std()       # Standard deviation
df['column'].var()       # Variance
df['column'].mad()       # Mean absolute deviation
df['column'].min()       # Minimum
df['column'].max()       # Maximum
df['column'].max() - df['column'].min()  # Range

# Distribution
df['column'].skew()      # Skewness
df['column'].kurtosis()  # Kurtosis

# Full summary
df.describe()            # Count, mean, std, min, 25%, 50%, 75%, max
df['column'].value_counts()  # Frequency of each value
```

### Correlation Analysis
```python
# Correlation matrix
df.corr()                # Pearson correlation
df.corr(method='spearman')  # Spearman correlation
df.corr(method='kendall')   # Kendall correlation

# Scatter matrix
pd.plotting.scatter_matrix(df, figsize=(12, 8))

# Specific correlation
df['col1'].corr(df['col2'])

# Correlation with target
df.corr()['target'].sort_values(ascending=False)
```

### Hypothesis Testing
```python
from scipy import stats

# T-test (two samples)
t_stat, p_value = stats.ttest_ind(group_a, group_b)
print(f"T-statistic: {t_stat}, P-value: {p_value}")

# Chi-square test
chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)

# ANOVA
f_stat, p_value = stats.f_oneway(group1, group2, group3)

# Normality test
stat, p_value = stats.shapiro(df['column'])

# Pearson correlation test
corr, p_value = stats.pearsonr(df['x'], df['y'])
```

### Time Series Analysis
```python
# Convert to datetime
df['date'] = pd.to_datetime(df['date'])
df.set_index('date', inplace=True)

# Resampling
df.resample('D').mean()      # Daily average
df.resample('W').sum()       # Weekly sum
df.resample('M').count()     # Monthly count

# Rolling calculations
df['rolling_mean'] = df['value'].rolling(window=7).mean()
df['rolling_std'] = df['value'].rolling(window=30).std()

# Time-based grouping
df.groupby(df.index.hour).mean()      # Hourly pattern
df.groupby(df.index.dayofweek).mean() # Weekly pattern

# Lag features
df['lag_1'] = df['value'].shift(1)
df['lag_7'] = df['value'].shift(7)

# Growth rate
df['growth'] = df['value'].pct_change()
```

## Data Visualization

### Matplotlib/Seaborn
```python
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
sns.set_style('whitegrid')
plt.figure(figsize=(12, 6))

# Line plot
plt.plot(df['date'], df['value'])
plt.xlabel('Date')
plt.ylabel('Value')
plt.title('Time Series')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Bar plot
sns.barplot(data=df, x='category', y='value')
plt.title('Values by Category')
plt.show()

# Histogram
plt.hist(df['value'], bins=30, edgecolor='black')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.title('Distribution')
plt.show()

# Box plot
sns.boxplot(data=df, x='category', y='value')
plt.title('Distribution by Category')
plt.show()

# Scatter plot
plt.scatter(df['x'], df['y'], alpha=0.5)
plt.xlabel('X')
plt.ylabel('Y')
plt.title('Scatter Plot')
plt.show()

# Heatmap (correlation)
sns.heatmap(df.corr(), annot=True, cmap='coolwarm', center=0)
plt.title('Correlation Matrix')
plt.show()

# Distribution plot
sns.displot(data=df, x='value', kde=True, hue='category')
plt.title('Distribution by Category')
plt.show()

# Pair plot
sns.pairplot(df, hue='category')
plt.show()

# Time series with rolling mean
plt.figure(figsize=(14, 6))
plt.plot(df.index, df['value'], label='Original', alpha=0.7)
plt.plot(df.index, df['rolling_mean'], label='7-day average', linewidth=2)
plt.legend()
plt.title('Value with Rolling Average')
plt.show()
```

### Interactive Plots (Plotly)
```python
import plotly.express as px
import plotly.graph_objects as go

# Line chart
fig = px.line(df, x='date', y='value', title='Time Series')
fig.show()

# Scatter with hover
fig = px.scatter(df, x='x', y='y', color='category',
                 hover_data=['name'])
fig.show()

# Bar chart
fig = px.bar(df, x='category', y='value', color='type')
fig.show()

# Heatmap
fig = px.imshow(df.corr(), text_auto=True)
fig.show()

# Interactive dashboard
from plotly.subplots import make_subplots

fig = make_subplots(rows=2, cols=2,
                    subplot_titles=('Line', 'Bar', 'Scatter', 'Histogram'))

fig.add_trace(go.Scatter(x=df['date'], y=df['value']), row=1, col=1)
fig.add_trace(go.Bar(x=df['category'], y=df['count']), row=1, col=2)
fig.add_trace(go.Scatter(x=df['x'], y=df['y'], mode='markers'), row=2, col=1)
fig.add_trace(go.Histogram(x=df['value']), row=2, col=2)

fig.show()
```

## Exploratory Data Analysis (EDA)

### EDA Checklist
```python
def eda_report(df):
    """Generate comprehensive EDA report"""

    print("=" * 50)
    print("DATA OVERVIEW")
    print("=" * 50)
    print(f"Shape: {df.shape}")
    print(f"Memory: {df.memory_usage().sum() / 1024**2:.2f} MB")
    print()

    print("=" * 50)
    print("DATA TYPES")
    print("=" * 50)
    print(df.dtypes)
    print()

    print("=" * 50)
    print("MISSING VALUES")
    print("=" * 50)
    missing = df.isnull().sum()
    missing_pct = (missing / len(df)) * 100
    print(pd.DataFrame({'Count': missing, 'Percent': missing_pct}))
    print()

    print("=" * 50)
    print("NUMERICAL SUMMARY")
    print("=" * 50)
    print(df.describe())
    print()

    print("=" * 50)
    print("CATEGORICAL SUMMARY")
    print("=" * 50)
    for col in df.select_dtypes(include='object').columns:
        print(f"\n{col}:")
        print(df[col].value_counts().head(10))
    print()

    print("=" * 50)
    print("CORRELATIONS")
    print("=" * 50)
    numeric_df = df.select_dtypes(include=[np.number])
    if len(numeric_df.columns) > 1:
        print(numeric_df.corr())

# Run report
eda_report(df)
```

### Anomaly Detection
```python
# Z-score method
from scipy import stats

def detect_outliers_zscore(df, column, threshold=3):
    z_scores = np.abs(stats.zscore(df[column]))
    return df[z_scores > threshold]

outliers = detect_outliers_zscore(df, 'value')
print(f"Found {len(outliers)} outliers")

# IQR method
def detect_outliers_iqr(df, column):
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    return df[(df[column] < lower) | (df[column] > upper)]

outliers = detect_outliers_iqr(df, 'value')

# Isolation Forest (advanced)
from sklearn.ensemble import IsolationForest

iso_forest = IsolationForest(contamination=0.1, random_state=42)
df['anomaly'] = iso_forest.fit_predict(df[['value']])
anomalies = df[df['anomaly'] == -1]
```

## Common Analysis Patterns

### Customer Analysis
```python
# Cohort analysis
df['cohort'] = df['signup_date'].dt.to_period('M')
df['period'] = (df['order_date'] - df['signup_date']).dt.month // 30 + 1

cohort_data = df.groupby(['cohort', 'period']).size().unstack()
cohort_pct = cohort_data.div(cohort_data.iloc[:, 0], axis=0)

# RFM Analysis (Recency, Frequency, Monetary)
from datetime import datetime

reference_date = df['order_date'].max() + timedelta(days=1)

rfm = df.groupby('customer_id').agg({
    'order_date': lambda x: (reference_date - x.max()).days,  # Recency
    'order_id': 'count',                                      # Frequency
    'amount': 'sum'                                           # Monetary
}).rename(columns={'order_date': 'recency', 'order_id': 'frequency', 'amount': 'monetary'})

# Score segments
rfm['R_score'] = pd.qcut(rfm['recency'], 5, labels=[5,4,3,2,1])
rfm['F_score'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1,2,3,4,5])
rfm['M_score'] = pd.qcut(rfm['monetary'].rank(method='first'), 5, labels=[1,2,3,4,5])

rfm['RFM_score'] = rfm['R_score'].astype(str) + rfm['F_score'].astype(str) + rfm['M_score'].astype(str)
```

### A/B Testing Analysis
```python
# Conversion rate comparison
from scipy import stats

def ab_test_analysis(control_conversions, control_total,
                    treatment_conversions, treatment_total):
    """Analyze A/B test results"""

    # Conversion rates
    control_rate = control_conversions / control_total
    treatment_rate = treatment_conversions / treatment_total

    # Relative uplift
    uplift = (treatment_rate - control_rate) / control_rate

    # Statistical significance (z-test)
    from statsmodels.stats.proportion import proportions_ztest

    count = np.array([control_conversions, treatment_conversions])
    nobs = np.array([control_total, treatment_total])
    z_stat, p_value = proportions_ztest(count, nobs)

    # Confidence interval
    se = np.sqrt(control_rate * (1 - control_rate) / control_total +
                 treatment_rate * (1 - treatment_rate) / treatment_total)
    ci_lower = (treatment_rate - control_rate) - 1.96 * se
    ci_upper = (treatment_rate - control_rate) + 1.96 * se

    return {
        'control_rate': control_rate,
        'treatment_rate': treatment_rate,
        'uplift': uplift,
        'p_value': p_value,
        'significant': p_value < 0.05,
        'ci': (ci_lower, ci_upper)
    }

result = ab_test_analysis(120, 1000, 150, 1000)
print(f"Control: {result['control_rate']:.2%}")
print(f"Treatment: {result['treatment_rate']:.2%}")
print(f"Uplift: {result['uplift']:.2%}")
print(f"Significant: {result['significant']}")
```

## Role-Shifting

When shifting **to** data analysis mode:
```
"Shifting to data analysis mode..."
→ Load and inspect data
→ Clean and preprocess
→ Explore distributions and patterns
→ Visualize insights
→ Document findings
```

## Gold Standard Integration

### Read-Back Verification
After creating analysis:
```python
# Verify output file exists
import os

output_file = 'analysis_results.csv'
df.to_csv(output_file, index=False)

# Verify
if os.path.exists(output_file):
    print(f"✅ Results saved to {output_file}")
    print(f"   Rows: {len(df)}, Columns: {len(df.columns)}")
else:
    print("❌ File not created")
```

### Executable Proof
Show analysis output:
```python
print(df.describe())
print("\nCorrelation matrix:")
print(df.corr())

# Save visualization
plt.savefig('distribution.png')
print("✅ Visualization saved to distribution.png")
```

---

**"Data speaks for itself, but only if you listen properly."**
