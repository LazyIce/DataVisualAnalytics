package edu.gatech.cse6242;

import java.io.IOException;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class Q1 {

  public static class MaxWeightMapper 
    extends Mapper<LongWritable, Text, Text, IntWritable> {

    @Override
    public void map(LongWritable key, Text value, Context context) 
      throws IOException, InterruptedException {
        
      String line = value.toString();
      String[] items = line.split("\t");
      String src = items[0];
      int weight = Integer.parseInt(items[2]);
      if (weight != 0) {
        context.write(new Text(src), new IntWritable(weight));
      }
    }
  }

  public static class MaxWeightReducer 
    extends Reducer<Text, IntWritable, Text, IntWritable> {

      @Override
      public void reduce(Text key, Iterable<IntWritable> values, Context context) 
        throws IOException, InterruptedException {

        int maxValue = Integer.MIN_VALUE;
        for (IntWritable value : values) {
          maxValue = Math.max(maxValue, value.get());
        }
        context.write(key, new IntWritable(maxValue));
      }
  }

  public static void main(String[] args) throws Exception {
    Configuration conf = new Configuration();
    Job job = Job.getInstance(conf, "Q1");

    job.setJarByClass(Q1.class);

    job.setMapperClass(MaxWeightMapper.class);
    job.setReducerClass(MaxWeightReducer.class);

    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(IntWritable.class);

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]));
    
    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}
