package edu.gatech.cse6242;

import java.io.*;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.jobcontrol.ControlledJob;
import org.apache.hadoop.mapreduce.lib.jobcontrol.JobControl;

public class Q4 {

  public static class DiffMapper
    extends Mapper<LongWritable, Text, Text, IntWritable> {

      @Override
      public void map(LongWritable key, Text value, Context context)
        throws IOException, InterruptedException {
          String line = value.toString();
          String[] nodes = line.split("\t");
          String source = nodes[0];
          String target = nodes[1];
          context.write(new Text(source), new IntWritable(1));
          context.write(new Text(target), new IntWritable(-1));
      }
  }

  public static class DiffReducer
    extends Reducer<Text, IntWritable, Text, IntWritable> {

      @Override
      public void reduce(Text key, Iterable<IntWritable> value, Context context)
        throws IOException, InterruptedException {
          int diff = 0;
          for (IntWritable degree: value) {
            diff += degree.get();
          }
          context.write(key, new IntWritable(diff));
      }
  }

  public static class SumMapper
    extends Mapper<LongWritable, Text, Text, IntWritable> {

      @Override
      public void map(LongWritable key, Text value, Context context)
        throws IOException, InterruptedException {
          String[] line = value.toString().split("\t");
          context.write(new Text(line[1]), new IntWritable(Integer.parseInt(line[0])));
      }
  }

  public static class SumReducer
    extends Reducer<Text, IntWritable, Text, IntWritable> {

      @Override
      public void reduce(Text key, Iterable<IntWritable> value, Context context)
        throws IOException, InterruptedException {
          int count = 0;
          for (IntWritable node: value) {
            count++;
          }
          context.write(key, new IntWritable(count));
      }
  }

  public static void main(String[] args) throws Exception {
      Configuration confHDFS = new Configuration();
      Path tempDir = new Path("temp");
      FileSystem fs = FileSystem.get(confHDFS);
      if (fs.exists(tempDir)) {
        fs.delete(tempDir, true);
      }

      JobControl jobControl = new JobControl("Q4ctrl");

      Configuration conf1 = new Configuration();
      Job job1 = Job.getInstance(conf1, "Q4_job1");
      job1.setJarByClass(Q4.class);

      job1.setMapperClass(DiffMapper.class);
      job1.setReducerClass(DiffReducer.class);

      job1.setOutputKeyClass(Text.class);
      job1.setOutputValueClass(IntWritable.class);

      FileInputFormat.addInputPath(job1, new Path(args[0]));
      FileOutputFormat.setOutputPath(job1, tempDir);
      
      ControlledJob ctrljob1 = new ControlledJob(conf1);
      ctrljob1.setJob(job1);
      jobControl.addJob(ctrljob1);
      
      Configuration conf2 = new Configuration();
      Job job2 = Job.getInstance(conf2, "Q4_job2");
      job2.setJarByClass(Q4.class);

      job2.setMapperClass(SumMapper.class);
      job2.setReducerClass(SumReducer.class);

      job2.setOutputKeyClass(Text.class);
      job2.setOutputValueClass(IntWritable.class);

      FileInputFormat.addInputPath(job2, tempDir);
      FileOutputFormat.setOutputPath(job2, new Path(args[1]));

      ControlledJob ctrljob2 = new ControlledJob(conf2);
      ctrljob2.setJob(job2);
      ctrljob2.addDependingJob(ctrljob1);  

      jobControl.addJob(ctrljob2);

      Thread jobControlThread = new Thread(jobControl);
      jobControlThread.start();

      while(!jobControl.allFinished()) {
        Thread.sleep(5000);
      }
      System.exit(0);
  }
}
